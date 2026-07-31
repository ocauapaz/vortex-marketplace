require "test_helper"

module Api
  module V1
    class ListingsControllerTest < ActionDispatch::IntegrationTest
      test "index é público e devolve dados com meta de paginação" do
        get api_v1_listings_path

        assert_response :success
        assert_equal Listing.count, response.parsed_body["meta"]["total"]
        assert_equal Listing.count, response.parsed_body["data"].size
      end

      test "index filtra por categoria" do
        get api_v1_listings_path, params: { category: "Saúde" }

        assert_response :success
        titles = response.parsed_body["data"].map { |listing| listing["title"] }
        assert_equal [ listings(:jaleco).title ], titles
      end

      test "index filtra por tipo" do
        get api_v1_listings_path, params: { kind: "donation" }

        assert_response :success
        kinds = response.parsed_body["data"].map { |listing| listing["kind"] }
        assert_equal [ "donation" ], kinds.uniq
      end

      test "index ignora filtro de tipo inválido em vez de quebrar" do
        get api_v1_listings_path, params: { kind: "qualquer-coisa" }

        assert_response :success
        assert_equal Listing.count, response.parsed_body["data"].size
      end

      test "index busca por termo" do
        get api_v1_listings_path, params: { q: "jaleco" }

        assert_response :success
        assert_equal [ listings(:jaleco).id ], response.parsed_body["data"].map { |listing| listing["id"] }
      end

      test "index limita per_page ao teto" do
        get api_v1_listings_path, params: { per_page: 500 }

        assert_response :success
        assert_equal ListingsController::MAX_PER_PAGE, response.parsed_body["meta"]["per_page"]
      end

      test "show devolve o anúncio com o dono" do
        get api_v1_listing_path(listings(:calculo))

        assert_response :success
        assert_equal users(:ana).name, response.parsed_body["data"]["user"]["name"]
      end

      test "show de id inexistente devolve 404" do
        get api_v1_listing_path(id: 0)

        assert_response :not_found
      end

      test "create sem token devolve 401" do
        assert_no_difference "Listing.count" do
          post api_v1_listings_path, params: { listing: valid_attributes }
        end

        assert_response :unauthorized
      end

      test "create com token cria o anúncio para o usuário autenticado" do
        assert_difference "Listing.count", 1 do
          post api_v1_listings_path, params: { listing: valid_attributes }, headers: auth_headers(users(:ana))
        end

        assert_response :created
        assert_equal users(:ana).id, Listing.order(:created_at).last.user_id
      end

      test "create com dados inválidos devolve 422 com os campos" do
        post api_v1_listings_path,
             params: { listing: valid_attributes(title: "ab", category: "Culinária") },
             headers: auth_headers(users(:ana))

        assert_response 422
        assert_includes response.parsed_body["details"].keys, "title"
        assert_includes response.parsed_body["details"].keys, "category"
      end

      test "create sem o envelope listing devolve 400" do
        post api_v1_listings_path, params: { title: "Sem envelope" }, headers: auth_headers(users(:ana))

        assert_response :bad_request
      end

      test "update do dono altera o anúncio" do
        patch api_v1_listing_path(listings(:calculo)),
              params: { listing: { title: "Cálculo A revisado" } },
              headers: auth_headers(users(:ana))

        assert_response :success
        assert_equal "Cálculo A revisado", listings(:calculo).reload.title
      end

      test "update de outro usuário devolve 403" do
        patch api_v1_listing_path(listings(:calculo)),
              params: { listing: { title: "Tomando o anúncio" } },
              headers: auth_headers(users(:bruno))

        assert_response :forbidden
        assert_equal "Cálculo A usado", listings(:calculo).reload.title
      end

      test "destroy do dono remove o anúncio" do
        assert_difference "Listing.count", -1 do
          delete api_v1_listing_path(listings(:jaleco)), headers: auth_headers(users(:bruno))
        end

        assert_response :no_content
      end

      test "destroy de outro usuário devolve 403" do
        assert_no_difference "Listing.count" do
          delete api_v1_listing_path(listings(:jaleco)), headers: auth_headers(users(:ana))
        end

        assert_response :forbidden
      end

      private

      def valid_attributes(overrides = {})
        {
          title: "Notebook para peças",
          description: "Tela quebrada, placa funcionando.",
          category: "Computação",
          kind: "sale",
          price_cents: 30_000,
          image_url: "https://picsum.photos/seed/notebook/600/400"
        }.merge(overrides)
      end
    end
  end
end
