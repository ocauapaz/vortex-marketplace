class User < ApplicationRecord
  MIN_PASSWORD_LENGTH = 8

  has_secure_password
  has_many :listings, dependent: :destroy

  normalizes :email, with: ->(email) { email.strip.downcase }

  validates :name, presence: true, length: { in: 2..60 }
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: MIN_PASSWORD_LENGTH }, allow_nil: true
  validates :course, length: { maximum: 60 }, allow_blank: true
end
