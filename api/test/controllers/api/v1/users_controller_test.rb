require "test_helper"

module Api
  module V1
    class UsersControllerTest < ActionDispatch::IntegrationTest
      test "me devolve o usuário autenticado" do
        get api_v1_me_path, headers: auth_headers(users(:ana))

        assert_response :success
        assert_equal users(:ana).email, response.parsed_body["user"]["email"]
      end

      test "me sem token devolve 401" do
        get api_v1_me_path

        assert_response :unauthorized
      end

      test "me com token inválido devolve 401" do
        get api_v1_me_path, headers: { "Authorization" => "Bearer token-falso" }

        assert_response :unauthorized
      end

      test "me com token expirado devolve 401" do
        token = travel_to(8.days.ago) { JsonWebToken.encode(users(:ana).id) }

        get api_v1_me_path, headers: { "Authorization" => "Bearer #{token}" }

        assert_response :unauthorized
      end

      test "me/listings devolve só os anúncios do próprio usuário" do
        get api_v1_me_listings_path, headers: auth_headers(users(:bruno))

        assert_response :success
        assert_equal [ listings(:jaleco).id ], response.parsed_body["data"].map { |listing| listing["id"] }
      end
    end
  end
end
