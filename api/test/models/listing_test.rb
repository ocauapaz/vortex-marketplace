require "test_helper"

class ListingTest < ActiveSupport::TestCase
  test "venda exige preço positivo" do
    listing = build(kind: "sale", price_cents: nil)

    assert_not listing.valid?
    assert_includes listing.errors.attribute_names, :price_cents
  end

  test "doação não pode ter preço" do
    listing = build(kind: "donation", price_cents: 1000)

    assert_not listing.valid?
    assert_includes listing.errors.attribute_names, :price_cents
  end

  test "categoria fora da lista é inválida" do
    listing = build(category: "Culinária")

    assert_not listing.valid?
    assert_includes listing.errors.attribute_names, :category
  end

  test "kind desconhecido vira erro de validação, não exceção" do
    listing = build(kind: "troca")

    assert_not listing.valid?
    assert_includes listing.errors.attribute_names, :kind
  end

  test "url de imagem precisa ser http" do
    listing = build(image_url: "javascript:alert(1)")

    assert_not listing.valid?
    assert_includes listing.errors.attribute_names, :image_url
  end

  test "busca encontra por título e por descrição" do
    assert_includes Listing.search("Cálculo"), listings(:calculo)
    assert_includes Listing.search("aulas práticas"), listings(:jaleco)
    assert_empty Listing.search("inexistente")
  end

  private

  def build(overrides)
    Listing.new({
      user: users(:ana),
      title: "Item de teste",
      description: "Descrição de teste.",
      category: "Livros",
      kind: "sale",
      price_cents: 1000
    }.merge(overrides))
  end
end
