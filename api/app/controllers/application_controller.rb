class ApplicationController < ActionController::API
  class Unauthorized < StandardError; end
  class Forbidden < StandardError; end

  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
  rescue_from ActiveRecord::RecordInvalid, with: :render_invalid
  rescue_from ActionController::ParameterMissing, with: :render_parameter_missing
  rescue_from Unauthorized, with: :render_unauthorized
  rescue_from Forbidden, with: :render_forbidden

  private

  def current_user
    return @current_user if defined?(@current_user)

    payload = JsonWebToken.decode(bearer_token)
    @current_user = payload && User.find_by(id: payload["sub"])
  end

  def authenticate!
    raise Unauthorized unless current_user
  end

  def bearer_token
    request.authorization.to_s[/\ABearer (.+)\z/, 1]
  end

  def render_error(message, status, details: nil)
    body = { error: message }
    body[:details] = details if details
    render json: body, status: status
  end

  def render_not_found
    render_error("Registro não encontrado.", :not_found)
  end

  def render_invalid(exception)
    render_error("Dados inválidos.", :unprocessable_content, details: exception.record.errors.messages)
  end

  def render_parameter_missing(exception)
    render_error("Parâmetro obrigatório ausente: #{exception.param}.", :bad_request)
  end

  def render_unauthorized
    render_error("Credenciais inválidas ou ausentes.", :unauthorized)
  end

  def render_forbidden
    render_error("Você não tem permissão para alterar este anúncio.", :forbidden)
  end
end
