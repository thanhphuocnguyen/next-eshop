import { number, z } from 'zod';
import { StrIdOptionSchema } from './common';
import { GeneralCategoryModel } from './category';

export type ManageProductListModel = {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageUrl?: string;
  basePrice: number;
  avgRating: number;
  reviewCount: number;
  sku: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryProductModel = {
  id: number;
  name: string;
  description: string;
  variantCount: number;
  imageUrl: string;
  priceFrom: number;
  priceTo: number;
  discountTo: number;
  createdAt: string;
};

export interface ProductCreateBody {
  name: string;
  description: string;
  price: number;
  discount?: number | null;
  stock: number;
  sku: string;
  slug: string;
  categoryId?: number;
  collectionId?: number;
  brandId?: number;
  attributes: {
    attributeId: number;
    valueIds: number[];
  }[];
}

export const BaseAttributeFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
});

export const AttributeFormSchema = BaseAttributeFormSchema.extend({
  values: z
    .object({
      id: z.number().optional(),
      value: z.string().min(1, 'At least 1 character is required'),
    })
    .array(),
});

export const ProductVariantAttributeFormSchema = BaseAttributeFormSchema.extend(
  {
    valueObject: z.object({
      id: z.number().optional(),
      value: z.string().optional(),
    }),
  }
);

export const VariantFormSchema = z.object({
  id: z.string().uuid().optional(),
  price: z.coerce.number().gt(0),
  stockQty: z.coerce.number().gte(0),
  sku: z.string().optional().readonly(),
  weight: z.coerce
    .number()
    .transform((v) => {
      if (!v) return null;
      return v;
    })
    .nullish(),
  isActive: z.boolean(),
  attributeValues: z
    .array(
      z.object({
        id: number(),
        value: z.string(),
      })
    )
    .transform((v) => v.map((e) => e.id)),
});

export const ProductFormSchema = z
  .object({
    name: z.string().min(3).max(100),
    description: z.string().min(10).max(5000),
    shortDescription: z.string().optional(),
    attributes: z.number().array().min(1, 'Select at least one attribute'),
    price: z.coerce.number().gt(0),
    sku: z.string().nonempty(),
    slug: z.string().nonempty(),
    isActive: z.boolean(),
    category: StrIdOptionSchema,
    brand: StrIdOptionSchema,
    collection: StrIdOptionSchema.extend({
      id: z.string().nullish(),
    }).nullish(),
    imageUrl: z.string().url().optional(),
    imageId: z.string().optional(),
  })
  .transform((data) => ({
    ...data,
    brandId: data.brand.id,
    categoryId: data.category.id,
    collectionId: data.collection?.id || null,
  }));

export type ProductModelForm = z.input<typeof ProductFormSchema>;
export type ProductModelFormOut = z.output<typeof ProductFormSchema>;

export type VariantModelForm = z.input<typeof VariantFormSchema>;
export type VariantModelFormOut = z.output<typeof VariantFormSchema>;

export type AttributeFormModel = z.infer<typeof AttributeFormSchema>;
export type ProductVariantAttributeFormModel = z.infer<
  typeof ProductVariantAttributeFormSchema
>;

export type AttributeValueModel = {
  id: number;
  value: string;
};

export type AttributeDetailModel = {
  id: number;
  name: string;
  values: AttributeValueModel[];
};

export type VariantDetailModel = {
  attributeValues: {
    id: number;
    name: string;
    value: string;
  }[];
  id: string;
  price: number;
  stock: number;
  sku: string;
  weight: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AssignmentImageModel = {
  id: string;
  entityId: string;
  entityType: string;
  displayOrder: number;
  role: string;
};

export type ProductImageModel = {
  id: string;
  externalId: string;
  url: string;
  role: string;
  assignments: AssignmentImageModel[];
};

export type ManageProductModel = {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  attributes: number[];
  slug: string;
  isActive: boolean;
  price: number;
  sku: string;
  category: GeneralCategoryModel;
  collection: GeneralCategoryModel;
  brand: GeneralCategoryModel;
  published: boolean;
  createdAt: string; // date
  updatedAt: string; // date
  ratingCount: number;
  oneStarCount: number;
  twoStarCount: number;
  threeStarCount: number;
  fourStarCount: number;
  fiveStarCount: number;
  imageUrl: string;
  imageId: string;
};
