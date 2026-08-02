module UserSerializer
  module_function

  # Perfil público, exibido junto de cada anúncio.
  def one(user)
    { id: user.id, name: user.name, course: user.course }
  end

  # Perfil do próprio usuário autenticado.
  def me(user)
    one(user).merge(email: user.email)
  end
end
