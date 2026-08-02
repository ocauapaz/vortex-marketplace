Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      post "auth/signup", to: "auth#signup"
      post "auth/login", to: "auth#login"

      get "me", to: "users#me"
      get "me/listings", to: "users#listings"

      get "stats", to: "stats#show"

      resources :listings, only: %i[index show create update destroy]
    end
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
end
