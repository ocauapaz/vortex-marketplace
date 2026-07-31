module ListingSerializer
  module_function

  def one(listing)
    {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      category: listing.category,
      kind: listing.kind,
      price_cents: listing.price_cents,
      image_url: listing.image_url,
      created_at: listing.created_at,
      user: UserSerializer.one(listing.user)
    }
  end

  def many(listings)
    listings.map { |listing| one(listing) }
  end
end
