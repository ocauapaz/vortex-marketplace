require "test_helper"

module Api
  module V1
    class StatsControllerTest < ActionDispatch::IntegrationTest
      test "stats é público e devolve os números da landing" do
        get api_v1_stats_path

        assert_response :success
        body = response.parsed_body
        assert_equal Listing.count, body["listings"]
        assert_equal Listing.donation.count, body["donations"]
        assert_equal User.count, body["users"]
        assert_equal Listing::CATEGORIES, body["available_categories"]
      end

      # CORS quebrado só aparece no navegador, nunca num teste comum. Este prende o contrato.
      test "libera CORS para a origem configurada" do
        get api_v1_stats_path, headers: { "Origin" => "http://localhost:5173" }

        assert_response :success
        assert_equal "http://localhost:5173", response.headers["Access-Control-Allow-Origin"]
      end
    end
  end
end
