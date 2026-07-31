module Api
  module V1
    class ListingsController < ApplicationController
      DEFAULT_PER_PAGE = 12
      MAX_PER_PAGE = 50

      before_action :authenticate!, only: %i[create update destroy]

      def index
        scope = Listing.includes(:user)
                       .recent
                       .by_category(params[:category])
                       .by_kind(params[:kind])
                       .search(params[:q])

        render json: {
          data: ListingSerializer.many(scope.offset((page - 1) * per_page).limit(per_page)),
          meta: { page: page, per_page: per_page, total: scope.count }
        }
      end

      def show
        render json: { data: ListingSerializer.one(Listing.includes(:user).find(params[:id])) }
      end

      def create
        listing = current_user.listings.create!(listing_params)
        render json: { data: ListingSerializer.one(listing) }, status: :created
      end

      def update
        listing = owned_listing
        listing.update!(listing_params)
        render json: { data: ListingSerializer.one(listing) }
      end

      def destroy
        owned_listing.destroy!
        head :no_content
      end

      private

      # 404 quando o anúncio não existe, 403 quando existe e é de outro usuário —
      # esconder a existência do recurso aqui não protege nada, a listagem é pública.
      def owned_listing
        listing = Listing.find(params[:id])
        raise Forbidden unless listing.user_id == current_user.id

        listing
      end

      def listing_params
        params.expect(listing: [ :title, :description, :category, :kind, :price_cents, :image_url ])
      end

      def page
        @page ||= [ params[:page].to_i, 1 ].max
      end

      def per_page
        @per_page ||= begin
          requested = params[:per_page].to_i
          requested.zero? ? DEFAULT_PER_PAGE : requested.clamp(1, MAX_PER_PAGE)
        end
      end
    end
  end
end
