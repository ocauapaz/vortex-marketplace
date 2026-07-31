module Api
  module V1
    class StatsController < ApplicationController
      def show
        render json: {
          listings: Listing.count,
          donations: Listing.donation.count,
          users: User.count,
          categories: Listing.group(:category).count,
          available_categories: Listing::CATEGORIES
        }
      end
    end
  end
end
