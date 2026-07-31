module Api
  module V1
    class AuthController < ApplicationController
      rate_limit to: 10, within: 1.minute,
                 with: -> { render_error("Muitas tentativas. Aguarde um minuto.", :too_many_requests) }

      def signup
        user = User.create!(signup_params)
        render json: session_payload(user), status: :created
      end

      def login
        user = User.authenticate_by(email: params[:email].to_s.strip.downcase, password: params[:password].to_s)
        raise Unauthorized unless user

        render json: session_payload(user)
      end

      private

      def signup_params
        params.expect(user: [ :name, :email, :password, :course ])
      end

      def session_payload(user)
        { token: JsonWebToken.encode(user.id), user: UserSerializer.me(user) }
      end
    end
  end
end
