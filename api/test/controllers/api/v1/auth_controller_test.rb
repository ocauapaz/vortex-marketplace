require "test_helper"

module Api
  module V1
    class AuthControllerTest < ActionDispatch::IntegrationTest
      test "signup cria o usuário e devolve token" do
        assert_difference "User.count", 1 do
          post api_v1_auth_signup_path, params: { user: signup_attributes }
        end

        assert_response :created
        assert response.parsed_body["token"].present?
        assert_equal "novo@aluno.unifor.br", response.parsed_body["user"]["email"]
      end

      test "signup normaliza o email" do
        post api_v1_auth_signup_path, params: { user: signup_attributes(email: "  NOVO@Aluno.Unifor.BR ") }

        assert_response :created
        assert_equal "novo@aluno.unifor.br", response.parsed_body["user"]["email"]
      end

      test "signup com email repetido devolve 422" do
        post api_v1_auth_signup_path, params: { user: signup_attributes(email: users(:ana).email) }

        assert_response 422
        assert_includes response.parsed_body["details"].keys, "email"
      end

      test "signup com senha curta devolve 422" do
        post api_v1_auth_signup_path, params: { user: signup_attributes(password: "123") }

        assert_response 422
        assert_includes response.parsed_body["details"].keys, "password"
      end

      test "login válido devolve token" do
        post api_v1_auth_login_path, params: { email: users(:ana).email, password: "vortex2026" }

        assert_response :success
        assert response.parsed_body["token"].present?
      end

      test "login com senha errada devolve 401" do
        post api_v1_auth_login_path, params: { email: users(:ana).email, password: "errada" }

        assert_response :unauthorized
        assert_nil response.parsed_body["token"]
      end

      test "login de email inexistente devolve 401" do
        post api_v1_auth_login_path, params: { email: "ninguem@aluno.unifor.br", password: "vortex2026" }

        assert_response :unauthorized
      end

      private

      def signup_attributes(overrides = {})
        {
          name: "Novo Aluno",
          email: "novo@aluno.unifor.br",
          password: "vortex2026",
          course: "Design"
        }.merge(overrides)
      end
    end
  end
end
