import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { paginationQuerySchema, ZodValidationPipe, type Pagination } from '@martronics/kit';
import { CurrentUser, Public, Roles, STAFF, type Principal } from '../common/auth.js';
import {
  addImageSchema,
  createCategorySchema,
  createProductSchema,
  createSubCategorySchema,
  idParamsSchema,
  listProductsQuerySchema,
  listSubCategoriesQuerySchema,
  productImageParamsSchema,
  updateCategorySchema,
  updateProductSchema,
  updateSubCategorySchema,
  type AddImage,
  type CreateCategory,
  type CreateProduct,
  type CreateSubCategory,
  type ListProductsQuery,
  type ListSubCategoriesQuery,
  type UpdateCategory,
  type UpdateProduct,
  type UpdateSubCategory,
} from './catalog.contract.js';
import { CatalogService } from './catalog.service.js';

const idParams = new ZodValidationPipe(idParamsSchema);

type AuthedRequest = { principal?: Principal };

@Controller('api/v1')
export class CatalogController {
  constructor(@Inject(CatalogService) private readonly catalog: CatalogService) {}

  // ---- categories ----

  @Public()
  @Get('categories')
  listCategories(@Query(new ZodValidationPipe(paginationQuerySchema)) page: Pagination) {
    return this.catalog.listCategories(page);
  }

  @Public()
  @Get('categories/:id')
  getCategory(@Param(idParams) p: { id: string }) {
    return this.catalog.getCategory(p.id);
  }

  @Roles(...STAFF)
  @Post('categories')
  createCategory(
    @CurrentUser() actor: Principal,
    @Body(new ZodValidationPipe(createCategorySchema)) body: CreateCategory,
  ) {
    return this.catalog.createCategory(actor, body);
  }

  @Roles(...STAFF)
  @Patch('categories/:id')
  updateCategory(
    @CurrentUser() actor: Principal,
    @Param(idParams) p: { id: string },
    @Body(new ZodValidationPipe(updateCategorySchema)) body: UpdateCategory,
  ) {
    return this.catalog.updateCategory(actor, p.id, body);
  }

  @Roles(...STAFF)
  @Delete('categories/:id')
  @HttpCode(204)
  async deleteCategory(@CurrentUser() actor: Principal, @Param(idParams) p: { id: string }) {
    await this.catalog.deleteCategory(actor, p.id);
  }

  // ---- sub-categories ----

  @Public()
  @Get('sub-categories')
  listSubCategories(
    @Query(new ZodValidationPipe(listSubCategoriesQuerySchema)) query: ListSubCategoriesQuery,
  ) {
    return this.catalog.listSubCategories(query);
  }

  @Public()
  @Get('sub-categories/:id')
  getSubCategory(@Param(idParams) p: { id: string }) {
    return this.catalog.getSubCategory(p.id);
  }

  @Roles(...STAFF)
  @Post('sub-categories')
  createSubCategory(
    @CurrentUser() actor: Principal,
    @Body(new ZodValidationPipe(createSubCategorySchema)) body: CreateSubCategory,
  ) {
    return this.catalog.createSubCategory(actor, body);
  }

  @Roles(...STAFF)
  @Patch('sub-categories/:id')
  updateSubCategory(
    @CurrentUser() actor: Principal,
    @Param(idParams) p: { id: string },
    @Body(new ZodValidationPipe(updateSubCategorySchema)) body: UpdateSubCategory,
  ) {
    return this.catalog.updateSubCategory(actor, p.id, body);
  }

  @Roles(...STAFF)
  @Delete('sub-categories/:id')
  @HttpCode(204)
  async deleteSubCategory(@CurrentUser() actor: Principal, @Param(idParams) p: { id: string }) {
    await this.catalog.deleteSubCategory(actor, p.id);
  }

  // ---- products ----

  @Public()
  @Get('products')
  listProducts(
    @Req() req: AuthedRequest,
    @Query(new ZodValidationPipe(listProductsQuerySchema)) query: ListProductsQuery,
  ) {
    return this.catalog.listProducts(query, req.principal);
  }

  @Public()
  @Get('products/:id')
  getProduct(@Req() req: AuthedRequest, @Param(idParams) p: { id: string }) {
    return this.catalog.getProduct(p.id, req.principal);
  }

  @Roles(...STAFF)
  @Post('products')
  createProduct(
    @CurrentUser() actor: Principal,
    @Body(new ZodValidationPipe(createProductSchema)) body: CreateProduct,
  ) {
    return this.catalog.createProduct(actor, body);
  }

  @Roles(...STAFF)
  @Patch('products/:id')
  updateProduct(
    @CurrentUser() actor: Principal,
    @Param(idParams) p: { id: string },
    @Body(new ZodValidationPipe(updateProductSchema)) body: UpdateProduct,
  ) {
    return this.catalog.updateProduct(actor, p.id, body);
  }

  @Roles(...STAFF)
  @Delete('products/:id')
  @HttpCode(204)
  async deleteProduct(@CurrentUser() actor: Principal, @Param(idParams) p: { id: string }) {
    await this.catalog.deleteProduct(actor, p.id);
  }

  @Public()
  @Get('products/:id/images')
  listImages(@Req() req: AuthedRequest, @Param(idParams) p: { id: string }) {
    return this.catalog.listImages(p.id, req.principal);
  }

  @Roles(...STAFF)
  @Post('products/:id/images')
  addImage(
    @CurrentUser() actor: Principal,
    @Param(idParams) p: { id: string },
    @Body(new ZodValidationPipe(addImageSchema)) body: AddImage,
  ) {
    return this.catalog.addImage(actor, p.id, body);
  }

  @Roles(...STAFF)
  @Delete('products/:id/images/:imageId')
  @HttpCode(204)
  async removeImage(
    @CurrentUser() actor: Principal,
    @Param(new ZodValidationPipe(productImageParamsSchema)) p: { id: string; imageId: string },
  ) {
    await this.catalog.removeImage(actor, p.id, p.imageId);
  }
}
