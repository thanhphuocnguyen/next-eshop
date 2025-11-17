export type GeneralCategoryModel = {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageUrl: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductCategory = {
  id: string;
  name: string;
  imageUrl?: string;
  minPrice: number;
  maxPrice: number;
  slug: string;
  variantCount: number;
};
