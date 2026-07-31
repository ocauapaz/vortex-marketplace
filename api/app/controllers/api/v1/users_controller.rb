module Api
  module V1
    class UsersController < ApplicationController
      before_action :authenticate!

      def me
        render json: { user: UserSerializer.me(current_user) }
      end

      def listings
        render json: { data: ListingSerializer.many(current_user.listings.includes(:user).recent) }
      end
    end
  end
end
