require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "email é normalizado para minúsculo e sem espaços" do
    user = User.create!(name: "Teste", email: "  Teste@Aluno.Unifor.BR ", password: "vortex2026")

    assert_equal "teste@aluno.unifor.br", user.email
  end

  test "email duplicado é rejeitado mesmo com caixa diferente" do
    user = User.new(name: "Outro", email: users(:ana).email.upcase, password: "vortex2026")

    assert_not user.valid?
    assert_includes user.errors.attribute_names, :email
  end

  test "apagar o usuário apaga os anúncios dele" do
    assert_difference "Listing.count", -1 do
      users(:bruno).destroy
    end
  end
end
