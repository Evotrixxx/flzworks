export type ListingTemplateInput = {
  id?: unknown;
  sellerId?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  photos?: unknown;
  favorites?: unknown;
  seller?: unknown;
  status?: unknown;
  [key: string]: unknown;
};

export function listingToTemplateValues(listing: ListingTemplateInput) {
  const values = { ...listing };

  delete values.id;
  delete values.sellerId;
  delete values.createdAt;
  delete values.updatedAt;
  delete values.photos;
  delete values.favorites;
  delete values.seller;

  return {
    ...values,
    status: "DRAFT" as const,
  };
}
