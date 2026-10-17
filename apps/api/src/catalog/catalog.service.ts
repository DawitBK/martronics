import { Inject, Injectable } from '@nestjs/common';
import { conflict, notFound, ProblemException, toPage, unprocessable } from '@martronics/kit';
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNull,
  lte,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import { recordAudit } from '../common/audit.js';
import type { Principal } from '../common/auth.js';
import { escapeLike, pgCode, versionConflict } from '../common/errors.js';
import { DB, type Database, type Tx } from '../db/db.module.js';
import {
  categories,
  CURRENCY,
  productImages,
  products,
  subCategories,
  type CategoryRow,
  type ProductRow,
  type SubCategoryRow,
} from '../db/schema.js';
import type {
  AddImage,
  CategoryDto,
  CreateCategory,
  CreateProduct,
  CreateSubCategory,
  ListProductsQuery,
  ListSubCategoriesQuery,
  ProductDto,
  ProductImageDto,
  ProductSortField,
  SubCategoryDto,
  UpdateCategory,
  UpdateProduct,
  UpdateSubCategory,
} from './catalog.contract.js';
import type { Pagination } from '@martronics/kit';

const PRODUCT_SORT = {
  name: products.name,
  priceMinor: products.priceMinor,
  createdAt: products.createdAt,
} satisfies Record<ProductSortField, unknown>;

export const toCategoryDto = (row: CategoryRow): CategoryDto => ({
  id: row.id,
  name: row.name,
  version: row.version,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export const toSubCategoryDto = (row: SubCategoryRow): SubCategoryDto => ({
  ...toCategoryDto(row),
  categoryId: row.categoryId,
});

export const toProductDto = (row: ProductRow, images: ProductImageDto[]): ProductDto => ({
  id: row.id,
  name: row.name,
  description: row.description,
  priceMinor: row.priceMinor,
  currency: CURRENCY,
  stock: row.stock,
  status: row.status,
  categoryId: row.categoryId,
  subCategoryId: row.subCategoryId,
  images,
  version: row.version,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

const touch = () => ({ version: sql`version + 1`, updatedAt: sql`now()` });

@Injectable()
export class CatalogService {
  constructor(@Inject(DB) private readonly db: Database) {}

  // ---------- categories ----------

  async listCategories(page: Pagination) {
    const where = isNull(categories.deletedAt);
    const [rows, totals] = await Promise.all([
      this.db
        .select()
        .from(categories)
        .where(where)
        .orderBy(asc(categories.name), asc(categories.id))
        .limit(page.limit)
        .offset(page.offset),
      this.db.select({ total: count() }).from(categories).where(where),
    ]);
    return toPage(rows.map(toCategoryDto), totals[0]?.total ?? 0, page);
  }

  async getCategory(id: string): Promise<CategoryDto> {
    const [row] = await this.db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), isNull(categories.deletedAt)));
    if (!row) throw notFound(`Category ${id} does not exist`);
    return toCategoryDto(row);
  }

  async createCategory(actor: Principal, input: CreateCategory): Promise<CategoryDto> {
    try {
      return await this.db.transaction(async (tx) => {
        const [row] = await tx.insert(categories).values({ name: input.name }).returning();
        const after = toCategoryDto(row!);
        await recordAudit(tx, {
          actor: actor.userId,
          action: 'category.created',
          entityType: 'category',
          entityId: after.id,
          after,
        });
        return after;
      });
    } catch (e) {
      throw mapNameConflict(e, 'category');
    }
  }

  async updateCategory(actor: Principal, id: string, input: UpdateCategory): Promise<CategoryDto> {
    try {
      return await this.db.transaction(async (tx) => {
        const [current] = await tx
          .select()
          .from(categories)
          .where(and(eq(categories.id, id), isNull(categories.deletedAt)))
          .for('update');
        if (!current) throw notFound(`Category ${id} does not exist`);
        if (current.version !== input.version) {
          throw versionConflict('category', current.version, input.version);
        }
        const [row] = await tx
          .update(categories)
          .set({ name: input.name, ...touch() })
          .where(eq(categories.id, id))
          .returning();
        const after = toCategoryDto(row!);
        await recordAudit(tx, {
          actor: actor.userId,
          action: 'category.updated',
          entityType: 'category',
          entityId: id,
          before: toCategoryDto(current),
          after,
        });
        return after;
      });
    } catch (e) {
      throw mapNameConflict(e, 'category');
    }
  }

  async deleteCategory(actor: Principal, id: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(categories)
        .where(and(eq(categories.id, id), isNull(categories.deletedAt)))
        .for('update');
      if (!current) throw notFound(`Category ${id} does not exist`);
      const [{ children } = { children: 0 }] = await tx
        .select({ children: count() })
        .from(subCategories)
        .where(and(eq(subCategories.categoryId, id), isNull(subCategories.deletedAt)));
      const [{ items } = { items: 0 }] = await tx
        .select({ items: count() })
        .from(products)
        .where(and(eq(products.categoryId, id), isNull(products.deletedAt)));
      if (children > 0 || items > 0) {
        throw conflict(
          'category-in-use',
          'Category is in use',
          `It still has ${children} sub-categories and ${items} products`,
        );
      }
      await tx
        .update(categories)
        .set({ deletedAt: sql`now()`, ...touch() })
        .where(eq(categories.id, id));
      await recordAudit(tx, {
        actor: actor.userId,
        action: 'category.deleted',
        entityType: 'category',
        entityId: id,
        before: toCategoryDto(current),
      });
    });
  }

  // ---------- sub-categories ----------

  async listSubCategories(query: ListSubCategoriesQuery) {
    const where: SQL[] = [isNull(subCategories.deletedAt)];
    if (query.categoryId) where.push(eq(subCategories.categoryId, query.categoryId));
    const [rows, totals] = await Promise.all([
      this.db
        .select()
        .from(subCategories)
        .where(and(...where))
        .orderBy(asc(subCategories.name), asc(subCategories.id))
        .limit(query.limit)
        .offset(query.offset),
      this.db
        .select({ total: count() })
        .from(subCategories)
        .where(and(...where)),
    ]);
    return toPage(rows.map(toSubCategoryDto), totals[0]?.total ?? 0, query);
  }

  async getSubCategory(id: string): Promise<SubCategoryDto> {
    const [row] = await this.db
      .select()
      .from(subCategories)
      .where(and(eq(subCategories.id, id), isNull(subCategories.deletedAt)));
    if (!row) throw notFound(`Sub-category ${id} does not exist`);
    return toSubCategoryDto(row);
  }

  async createSubCategory(actor: Principal, input: CreateSubCategory): Promise<SubCategoryDto> {
    try {
      return await this.db.transaction(async (tx) => {
        await this.requireCategory(tx, input.categoryId);
        const [row] = await tx
          .insert(subCategories)
          .values({ categoryId: input.categoryId, name: input.name })
          .returning();
        const after = toSubCategoryDto(row!);
        await recordAudit(tx, {
          actor: actor.userId,
          action: 'sub-category.created',
          entityType: 'sub-category',
          entityId: after.id,
          after,
        });
        return after;
      });
    } catch (e) {
      throw mapNameConflict(e, 'sub-category');
    }
  }

  async updateSubCategory(
    actor: Principal,
    id: string,
    input: UpdateSubCategory,
  ): Promise<SubCategoryDto> {
    try {
      return await this.db.transaction(async (tx) => {
        const [current] = await tx
          .select()
          .from(subCategories)
          .where(and(eq(subCategories.id, id), isNull(subCategories.deletedAt)))
          .for('update');
        if (!current) throw notFound(`Sub-category ${id} does not exist`);
        if (current.version !== input.version) {
          throw versionConflict('sub-category', current.version, input.version);
        }
        if (input.categoryId && input.categoryId !== current.categoryId) {
          await this.requireCategory(tx, input.categoryId);
          const [{ items } = { items: 0 }] = await tx
            .select({ items: count() })
            .from(products)
            .where(and(eq(products.subCategoryId, id), isNull(products.deletedAt)));
          if (items > 0) {
            throw conflict(
              'sub-category-in-use',
              'Sub-category is in use',
              `It has ${items} products; move them first so no product points at a mismatched pair`,
            );
          }
        }
        const [row] = await tx
          .update(subCategories)
          .set({
            ...(input.name !== undefined ? { name: input.name } : {}),
            ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
            ...touch(),
          })
          .where(eq(subCategories.id, id))
          .returning();
        const after = toSubCategoryDto(row!);
        await recordAudit(tx, {
          actor: actor.userId,
          action: 'sub-category.updated',
          entityType: 'sub-category',
          entityId: id,
          before: toSubCategoryDto(current),
          after,
        });
        return after;
      });
    } catch (e) {
      throw mapNameConflict(e, 'sub-category');
    }
  }

  async deleteSubCategory(actor: Principal, id: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(subCategories)
        .where(and(eq(subCategories.id, id), isNull(subCategories.deletedAt)))
        .for('update');
      if (!current) throw notFound(`Sub-category ${id} does not exist`);
      const [{ items } = { items: 0 }] = await tx
        .select({ items: count() })
        .from(products)
        .where(and(eq(products.subCategoryId, id), isNull(products.deletedAt)));
      if (items > 0) {
        throw conflict('sub-category-in-use', 'Sub-category is in use', `It has ${items} products`);
      }
      await tx
        .update(subCategories)
        .set({ deletedAt: sql`now()`, ...touch() })
        .where(eq(subCategories.id, id));
      await recordAudit(tx, {
        actor: actor.userId,
        action: 'sub-category.deleted',
        entityType: 'sub-category',
        entityId: id,
        before: toSubCategoryDto(current),
      });
    });
  }

  // ---------- products ----------

  async listProducts(query: ListProductsQuery, principal: Principal | undefined) {
    const isStaff = principal?.role === 'manager' || principal?.role === 'admin';
    const where: SQL[] = [isNull(products.deletedAt)];
    // Customers and anonymous visitors only ever see active products.
    where.push(eq(products.status, isStaff && query.status ? query.status : 'active'));
    if (query.q) {
      const like = `%${escapeLike(query.q)}%`;
      where.push(or(ilike(products.name, like), ilike(products.description, like)) as SQL);
    }
    if (query.categoryId) where.push(eq(products.categoryId, query.categoryId));
    if (query.subCategoryId) where.push(eq(products.subCategoryId, query.subCategoryId));
    if (query.minPriceMinor !== undefined)
      where.push(gte(products.priceMinor, query.minPriceMinor));
    if (query.maxPriceMinor !== undefined)
      where.push(lte(products.priceMinor, query.maxPriceMinor));
    if (query.inStock) where.push(gt(products.stock, 0));
    const order = [
      ...query.sort.map((s) => (s.direction === 'asc' ? asc : desc)(PRODUCT_SORT[s.field])),
      asc(products.id), // deterministic tiebreaker keeps pages stable
    ];
    const [rows, totals] = await Promise.all([
      this.db
        .select()
        .from(products)
        .where(and(...where))
        .orderBy(...order)
        .limit(query.limit)
        .offset(query.offset),
      this.db
        .select({ total: count() })
        .from(products)
        .where(and(...where)),
    ]);
    const images = await this.imagesFor(rows.map((r) => r.id));
    return toPage(
      rows.map((r) => toProductDto(r, images.get(r.id) ?? [])),
      totals[0]?.total ?? 0,
      query,
    );
  }

  async getProduct(id: string, principal: Principal | undefined): Promise<ProductDto> {
    const isStaff = principal?.role === 'manager' || principal?.role === 'admin';
    const [row] = await this.db
      .select()
      .from(products)
      .where(and(eq(products.id, id), isNull(products.deletedAt)));
    // An archived product is hidden from the public as if it did not exist.
    if (!row || (row.status === 'archived' && !isStaff)) {
      throw notFound(`Product ${id} does not exist`);
    }
    const images = await this.imagesFor([id]);
    return toProductDto(row, images.get(id) ?? []);
  }

  async createProduct(actor: Principal, input: CreateProduct): Promise<ProductDto> {
    return this.db.transaction(async (tx) => {
      await this.requireCategoryPair(tx, input.categoryId, input.subCategoryId);
      const [row] = await tx
        .insert(products)
        .values({
          name: input.name,
          description: input.description,
          priceMinor: input.priceMinor,
          stock: input.stock,
          categoryId: input.categoryId,
          subCategoryId: input.subCategoryId,
          createdBy: actor.userId,
        })
        .returning();
      const after = toProductDto(row!, []);
      await recordAudit(tx, {
        actor: actor.userId,
        action: 'product.created',
        entityType: 'product',
        entityId: after.id,
        after,
      });
      return after;
    });
  }

  async updateProduct(actor: Principal, id: string, input: UpdateProduct): Promise<ProductDto> {
    return this.db.transaction(async (tx) => {
      const current = await this.lockLiveProduct(tx, id);
      if (current.version !== input.version) {
        throw versionConflict('product', current.version, input.version);
      }
      const categoryId = input.categoryId ?? current.categoryId;
      const subCategoryId = input.subCategoryId ?? current.subCategoryId;
      if (input.categoryId !== undefined || input.subCategoryId !== undefined) {
        await this.requireCategoryPair(tx, categoryId, subCategoryId);
      }
      const changes: Partial<UpdateProduct> = { ...input };
      delete changes.version; // the token is compared above and bumped by touch(), never written
      const [row] = await tx
        .update(products)
        .set({ ...changes, ...touch() })
        .where(eq(products.id, id))
        .returning();
      const images = await this.imagesFor([id], tx);
      const after = toProductDto(row!, images.get(id) ?? []);
      await recordAudit(tx, {
        actor: actor.userId,
        action: 'product.updated',
        entityType: 'product',
        entityId: id,
        before: toProductDto(current, images.get(id) ?? []),
        after,
      });
      return after;
    });
  }

  async deleteProduct(actor: Principal, id: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      const current = await this.lockLiveProduct(tx, id);
      await tx
        .update(products)
        .set({ deletedAt: sql`now()`, ...touch() })
        .where(eq(products.id, id));
      await recordAudit(tx, {
        actor: actor.userId,
        action: 'product.deleted',
        entityType: 'product',
        entityId: id,
        before: toProductDto(current, []),
      });
    });
  }

  async addImage(actor: Principal, productId: string, input: AddImage): Promise<ProductImageDto> {
    return this.db.transaction(async (tx) => {
      await this.lockLiveProduct(tx, productId);
      const [row] = await tx
        .insert(productImages)
        .values({ productId, url: input.url, position: input.position })
        .returning();
      const dto = { id: row!.id, url: row!.url, position: row!.position };
      await recordAudit(tx, {
        actor: actor.userId,
        action: 'product.image-added',
        entityType: 'product',
        entityId: productId,
        after: dto,
      });
      return dto;
    });
  }

  async listImages(productId: string, principal: Principal | undefined) {
    const product = await this.getProduct(productId, principal);
    return product.images;
  }

  async removeImage(actor: Principal, productId: string, imageId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await this.lockLiveProduct(tx, productId);
      const removed = await tx
        .delete(productImages)
        .where(and(eq(productImages.id, imageId), eq(productImages.productId, productId)))
        .returning();
      if (removed.length === 0) throw notFound(`Image ${imageId} does not exist`);
      await recordAudit(tx, {
        actor: actor.userId,
        action: 'product.image-removed',
        entityType: 'product',
        entityId: productId,
        before: { id: imageId, url: removed[0]!.url },
      });
    });
  }

  // ---------- helpers ----------

  private async imagesFor(
    productIds: string[],
    executor: Pick<Database, 'select'> = this.db,
  ): Promise<Map<string, ProductImageDto[]>> {
    const map = new Map<string, ProductImageDto[]>();
    if (productIds.length === 0) return map;
    const rows = await executor
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, productIds))
      .orderBy(asc(productImages.position), asc(productImages.id));
    for (const r of rows) {
      const list = map.get(r.productId) ?? [];
      list.push({ id: r.id, url: r.url, position: r.position });
      map.set(r.productId, list);
    }
    return map;
  }

  private async lockLiveProduct(tx: Tx, id: string): Promise<ProductRow> {
    const [row] = await tx
      .select()
      .from(products)
      .where(and(eq(products.id, id), isNull(products.deletedAt)))
      .for('update');
    if (!row) throw notFound(`Product ${id} does not exist`);
    return row;
  }

  private async requireCategory(tx: Tx, id: string): Promise<void> {
    const [row] = await tx
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.id, id), isNull(categories.deletedAt)));
    if (!row) throw unprocessable('category-missing', 'Category does not exist', `Category ${id}`);
  }

  /** A product's sub-category must exist and belong to the product's category. */
  private async requireCategoryPair(tx: Tx, categoryId: string, subCategoryId: string) {
    await this.requireCategory(tx, categoryId);
    const [sub] = await tx
      .select()
      .from(subCategories)
      .where(and(eq(subCategories.id, subCategoryId), isNull(subCategories.deletedAt)));
    if (!sub) {
      throw unprocessable('sub-category-missing', 'Sub-category does not exist', subCategoryId);
    }
    if (sub.categoryId !== categoryId) {
      throw unprocessable(
        'category-mismatch',
        'Sub-category belongs to a different category',
        `Sub-category ${subCategoryId} is not under category ${categoryId}`,
      );
    }
  }
}

function mapNameConflict(error: unknown, what: string): unknown {
  if (error instanceof ProblemException) return error;
  if (pgCode(error) === '23505') {
    return conflict('name-taken', `A ${what} with this name already exists`);
  }
  return error;
}
