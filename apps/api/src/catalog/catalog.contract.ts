import { pageSchema, paginationQuerySchema, sortQuerySchema } from '@martronics/kit';
import { z } from 'zod';
import { PRODUCT_STATUSES } from '../db/schema.js';

export const idParamsSchema = z.object({ id: z.uuid() });
export const productImageParamsSchema = z.object({ id: z.uuid(), imageId: z.uuid() });

const name = z.string().trim().min(1).max(200);
const versionField = z
  .number()
  .int()
  .min(1)
  .describe('The version you last read; a mismatch returns 409');

// ---- categories and sub-categories ----

export const categorySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  version: z.number().int().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type CategoryDto = z.output<typeof categorySchema>;

export const subCategorySchema = categorySchema.extend({ categoryId: z.uuid() });
export type SubCategoryDto = z.output<typeof subCategorySchema>;

export const createCategorySchema = z.object({ name }).strict();
export type CreateCategory = z.output<typeof createCategorySchema>;
export const updateCategorySchema = z.object({ version: versionField, name }).strict();
export type UpdateCategory = z.output<typeof updateCategorySchema>;

export const createSubCategorySchema = z.object({ categoryId: z.uuid(), name }).strict();
export type CreateSubCategory = z.output<typeof createSubCategorySchema>;
export const updateSubCategorySchema = z
  .object({ version: versionField, name: name.optional(), categoryId: z.uuid().optional() })
  .strict()
  .refine((v) => v.name !== undefined || v.categoryId !== undefined, {
    message: 'Provide at least one field to change',
  });
export type UpdateSubCategory = z.output<typeof updateSubCategorySchema>;

export const listSubCategoriesQuerySchema = paginationQuerySchema.extend({
  categoryId: z.uuid().optional(),
});
export type ListSubCategoriesQuery = z.output<typeof listSubCategoriesQuerySchema>;

export const categoryPageSchema = pageSchema(categorySchema);
export const subCategoryPageSchema = pageSchema(subCategorySchema);

// ---- products ----

export const productImageSchema = z.object({
  id: z.uuid(),
  url: z.url(),
  position: z.number().int().min(0),
});
export type ProductImageDto = z.output<typeof productImageSchema>;

export const productSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  priceMinor: z.number().int().min(0).describe('Price in minor units (santim); 12050 = 120.50'),
  currency: z.string(),
  stock: z.number().int().min(0),
  status: z.enum(PRODUCT_STATUSES),
  categoryId: z.uuid(),
  subCategoryId: z.uuid(),
  images: z.array(productImageSchema),
  version: z.number().int().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type ProductDto = z.output<typeof productSchema>;

const priceMinor = z.number().int().min(0).max(1_000_000_000_00);
const stock = z.number().int().min(0).max(1_000_000);

export const createProductSchema = z
  .object({
    name,
    description: z.string().trim().min(1).max(5000),
    priceMinor,
    stock: stock.default(0),
    categoryId: z.uuid(),
    subCategoryId: z.uuid(),
  })
  .strict();
export type CreateProduct = z.output<typeof createProductSchema>;

export const updateProductSchema = z
  .object({
    version: versionField,
    name: name.optional(),
    description: z.string().trim().min(1).max(5000).optional(),
    priceMinor: priceMinor.optional(),
    stock: stock.optional(),
    status: z.enum(PRODUCT_STATUSES).optional(),
    categoryId: z.uuid().optional(),
    subCategoryId: z.uuid().optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).some((k) => k !== 'version'), {
    message: 'Provide at least one field to change',
  });
export type UpdateProduct = z.output<typeof updateProductSchema>;

export const PRODUCT_SORT_FIELDS = ['name', 'priceMinor', 'createdAt'] as const;
export type ProductSortField = (typeof PRODUCT_SORT_FIELDS)[number];

const boolean = z
  .enum(['true', 'false'])
  .transform((v) => v === 'true')
  .optional();

export const listProductsQuerySchema = paginationQuerySchema
  .extend({
    q: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .optional()
      .describe('Case-insensitive name or description'),
    categoryId: z.uuid().optional(),
    subCategoryId: z.uuid().optional(),
    minPriceMinor: z.coerce.number().int().min(0).optional(),
    maxPriceMinor: z.coerce.number().int().min(0).optional(),
    inStock: boolean.describe('Only products with stock above zero'),
    status: z
      .enum(PRODUCT_STATUSES)
      .optional()
      .describe('Staff only; everyone else always sees active products'),
    sort: sortQuerySchema(PRODUCT_SORT_FIELDS, [{ field: 'createdAt', direction: 'desc' }]),
  })
  .refine(
    (v) =>
      v.minPriceMinor === undefined ||
      v.maxPriceMinor === undefined ||
      v.minPriceMinor <= v.maxPriceMinor,
    { message: 'minPriceMinor must not exceed maxPriceMinor' },
  );
export type ListProductsQuery = z.output<typeof listProductsQuerySchema>;
export const productPageSchema = pageSchema(productSchema);

export const addImageSchema = z
  .object({
    url: z
      .url()
      .max(2000)
      .refine((u) => u.startsWith('https://'), { message: 'Image URLs must use https' }),
    position: z.number().int().min(0).max(100).default(0),
  })
  .strict();
export type AddImage = z.output<typeof addImageSchema>;
