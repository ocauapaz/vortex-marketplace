# Be sure to restart your server when you modify this file.
#
# O front roda em outra origem (Vite local ou GitHub Pages), então o navegador exige CORS.
# FRONTEND_ORIGIN aceita várias origens separadas por vírgula.

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch("FRONTEND_ORIGIN", "http://localhost:5173").split(",").map(&:strip)

    resource "*",
      headers: :any,
      methods: %i[get post patch delete options head]
  end
end
