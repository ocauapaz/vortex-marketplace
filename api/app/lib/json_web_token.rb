module JsonWebToken
  ALGORITHM = "HS256".freeze
  EXPIRATION = 7.days

  module_function

  def encode(user_id)
    JWT.encode({ sub: user_id, exp: EXPIRATION.from_now.to_i }, secret, ALGORITHM)
  end

  # Retorna o payload ou nil — token inválido, expirado ou ausente não é exceção aqui,
  # é só ausência de sessão, tratada com 401 no controller.
  def decode(token)
    return nil if token.blank?

    JWT.decode(token, secret, true, algorithm: ALGORITHM).first
  rescue JWT::DecodeError
    nil
  end

  def secret
    Rails.application.secret_key_base
  end
end
