class Listing < ApplicationRecord
  CATEGORIES = %w[Livros Engenharia Computação Saúde Móveis Eletrônicos Outros].freeze

  belongs_to :user

  enum :kind, { sale: "sale", donation: "donation" }, validate: true

  validates :title, presence: true, length: { in: 3..80 }
  validates :description, presence: true, length: { maximum: 600 }
  validates :category, inclusion: { in: CATEGORIES }
  # \z e \S impedem que uma segunda linha maliciosa ("https://ok\njavascript:...") passe pelo filtro.
  validates :image_url, format: { with: %r{\Ahttps?://\S+\z}, message: "deve ser uma URL http:// ou https://" }, allow_blank: true
  validates :price_cents, numericality: { only_integer: true, greater_than: 0 }, if: :sale?
  validates :price_cents, absence: true, if: :donation?

  scope :recent, -> { order(created_at: :desc) }
  scope :by_category, ->(category) { where(category: category) if category.present? }
  scope :by_kind, ->(kind) { where(kind: kind) if kinds.key?(kind) }
  scope :search, ->(term) {
    where("title LIKE :term OR description LIKE :term", term: "%#{sanitize_sql_like(term)}%") if term.present?
  }
end
