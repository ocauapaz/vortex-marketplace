class CreateListings < ActiveRecord::Migration[8.1]
  def change
    create_table :listings do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title, null: false
      t.text :description, null: false
      t.string :category, null: false
      t.string :kind, null: false
      t.integer :price_cents
      t.string :image_url

      t.timestamps
    end

    add_index :listings, :category
    add_index :listings, :kind
    add_index :listings, :created_at
  end
end
