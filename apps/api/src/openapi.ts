import { Controller, Get } from '@nestjs/common';
import { OpenApiRegistry, paginationQuerySchema, type RouteDef } from '@martronics/kit';
import { z } from 'zod';
import {
  listUsersQuerySchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  setRoleSchema,
  tokenPairSchema,
  updateMeSchema,
  userPageSchema,
  userSchema,
} from './auth/auth.contract.js';
import {
  addImageSchema,
  categoryPageSchema,
  categorySchema,
  createCategorySchema,
  createProductSchema,
  createSubCategorySchema,
  idParamsSchema,
  listProductsQuerySchema,
  listSubCategoriesQuerySchema,
  productImageParamsSchema,
  productImageSchema,
  productPageSchema,
  productSchema,
  subCategoryPageSchema,
  subCategorySchema,
  updateCategorySchema,
  updateProductSchema,
  updateSubCategorySchema,
} from './catalog/catalog.contract.js';
import { cartSchema, productParamsSchema, setCartItemSchema } from './cart/cart.contract.js';
import { Public } from './common/auth.js';
import {
  checkoutSchema,
  createPaymentSchema,
  idempotencyHeaderSchema,
  listOrdersQuerySchema,
  orderPageSchema,
  orderSchema,
  paymentSchema,
} from './orders/orders.contract.js';

type Access = 'public' | 'user' | 'staff' | 'admin';

const ACCESS_NOTE: Record<Access, string> = {
  public: 'No sign-in needed.',
  user: 'Requires a signed-in user.',
  staff: 'Requires the manager or admin role.',
  admin: 'Requires the admin role.',
};

const route = (access: Access, def: RouteDef): RouteDef => ({
  ...def,
  summary: `${def.summary}. ${ACCESS_NOTE[access]}`,
  // The registry has no notion of security; it is added to the document below by path and method.
  responses: def.responses,
});

const ACCESS_BY_OPERATION = new Map<string, Access>();
const def = (access: Access, d: RouteDef): RouteDef => {
  ACCESS_BY_OPERATION.set(d.operationId, access);
  return route(access, d);
};

let cached: Record<string, unknown> | undefined;

/** The OpenAPI document, built from the same schemas the controllers validate with. */
export function openApiDocument(): Record<string, unknown> {
  if (cached) return cached;
  const registry = new OpenApiRegistry({
    title: 'Martronics API',
    version: '0.1.0',
    description:
      'E-commerce API: identity, catalog, cart, orders and payments. Money is integer minor units (santim).',
  });
  const A = '/api/v1';
  const tag = (t: string) => ({ tags: [t] });
  const noContent = { 204: { description: 'Done' } };

  [
    def('public', {
      method: 'post',
      path: `${A}/auth/register`,
      operationId: 'register',
      summary: 'Create a customer account',
      ...tag('auth'),
      request: { body: registerSchema },
      responses: { 201: { description: 'Created', schema: userSchema } },
    }),
    def('public', {
      method: 'post',
      path: `${A}/auth/login`,
      operationId: 'login',
      summary: 'Exchange credentials for tokens',
      ...tag('auth'),
      request: { body: loginSchema },
      responses: { 200: { description: 'Tokens', schema: tokenPairSchema } },
    }),
    def('public', {
      method: 'post',
      path: `${A}/auth/refresh`,
      operationId: 'refresh',
      summary: 'Rotate a refresh token (a reused token revokes the whole session)',
      ...tag('auth'),
      request: { body: refreshSchema },
      responses: { 200: { description: 'New tokens', schema: tokenPairSchema } },
    }),
    def('public', {
      method: 'post',
      path: `${A}/auth/logout`,
      operationId: 'logout',
      summary: 'Revoke the session of a refresh token',
      ...tag('auth'),
      request: { body: refreshSchema },
      responses: noContent,
    }),
    def('user', {
      method: 'get',
      path: `${A}/me`,
      operationId: 'getMe',
      summary: 'The signed-in user',
      ...tag('auth'),
      responses: { 200: { description: 'The user', schema: userSchema } },
    }),
    def('user', {
      method: 'patch',
      path: `${A}/me`,
      operationId: 'updateMe',
      summary: 'Update your own name (optimistic concurrency via version)',
      ...tag('auth'),
      request: { body: updateMeSchema },
      responses: { 200: { description: 'The user', schema: userSchema } },
    }),
    def('admin', {
      method: 'get',
      path: `${A}/users`,
      operationId: 'listUsers',
      summary: 'List users',
      ...tag('users'),
      request: { query: listUsersQuerySchema },
      responses: { 200: { description: 'A page of users', schema: userPageSchema } },
    }),
    def('admin', {
      method: 'patch',
      path: `${A}/users/{id}/role`,
      operationId: 'setUserRole',
      summary: 'Change a user role (never your own)',
      ...tag('users'),
      request: { params: idParamsSchema, body: setRoleSchema },
      responses: { 200: { description: 'The user', schema: userSchema } },
    }),

    def('public', {
      method: 'get',
      path: `${A}/categories`,
      operationId: 'listCategories',
      summary: 'List categories',
      ...tag('catalog'),
      request: { query: paginationQuerySchema },
      responses: { 200: { description: 'A page', schema: categoryPageSchema } },
    }),
    def('public', {
      method: 'get',
      path: `${A}/categories/{id}`,
      operationId: 'getCategory',
      summary: 'Get a category',
      ...tag('catalog'),
      request: { params: idParamsSchema },
      responses: { 200: { description: 'The category', schema: categorySchema } },
    }),
    def('staff', {
      method: 'post',
      path: `${A}/categories`,
      operationId: 'createCategory',
      summary: 'Create a category',
      ...tag('catalog'),
      request: { body: createCategorySchema },
      responses: { 201: { description: 'Created', schema: categorySchema } },
    }),
    def('staff', {
      method: 'patch',
      path: `${A}/categories/{id}`,
      operationId: 'updateCategory',
      summary: 'Rename a category',
      ...tag('catalog'),
      request: { params: idParamsSchema, body: updateCategorySchema },
      responses: { 200: { description: 'The category', schema: categorySchema } },
    }),
    def('staff', {
      method: 'delete',
      path: `${A}/categories/{id}`,
      operationId: 'deleteCategory',
      summary: 'Soft-delete an empty category',
      ...tag('catalog'),
      request: { params: idParamsSchema },
      responses: noContent,
    }),
    def('public', {
      method: 'get',
      path: `${A}/sub-categories`,
      operationId: 'listSubCategories',
      summary: 'List sub-categories',
      ...tag('catalog'),
      request: { query: listSubCategoriesQuerySchema },
      responses: { 200: { description: 'A page', schema: subCategoryPageSchema } },
    }),
    def('public', {
      method: 'get',
      path: `${A}/sub-categories/{id}`,
      operationId: 'getSubCategory',
      summary: 'Get a sub-category',
      ...tag('catalog'),
      request: { params: idParamsSchema },
      responses: { 200: { description: 'The sub-category', schema: subCategorySchema } },
    }),
    def('staff', {
      method: 'post',
      path: `${A}/sub-categories`,
      operationId: 'createSubCategory',
      summary: 'Create a sub-category',
      ...tag('catalog'),
      request: { body: createSubCategorySchema },
      responses: { 201: { description: 'Created', schema: subCategorySchema } },
    }),
    def('staff', {
      method: 'patch',
      path: `${A}/sub-categories/{id}`,
      operationId: 'updateSubCategory',
      summary: 'Update a sub-category',
      ...tag('catalog'),
      request: { params: idParamsSchema, body: updateSubCategorySchema },
      responses: { 200: { description: 'The sub-category', schema: subCategorySchema } },
    }),
    def('staff', {
      method: 'delete',
      path: `${A}/sub-categories/{id}`,
      operationId: 'deleteSubCategory',
      summary: 'Soft-delete an empty sub-category',
      ...tag('catalog'),
      request: { params: idParamsSchema },
      responses: noContent,
    }),
    def('public', {
      method: 'get',
      path: `${A}/products`,
      operationId: 'listProducts',
      summary: 'Search and filter products',
      ...tag('catalog'),
      request: { query: listProductsQuerySchema as unknown as z.ZodObject },
      responses: { 200: { description: 'A page', schema: productPageSchema } },
    }),
    def('public', {
      method: 'get',
      path: `${A}/products/{id}`,
      operationId: 'getProduct',
      summary: 'Get a product',
      ...tag('catalog'),
      request: { params: idParamsSchema },
      responses: { 200: { description: 'The product', schema: productSchema } },
    }),
    def('staff', {
      method: 'post',
      path: `${A}/products`,
      operationId: 'createProduct',
      summary: 'Create a product',
      ...tag('catalog'),
      request: { body: createProductSchema },
      responses: { 201: { description: 'Created', schema: productSchema } },
    }),
    def('staff', {
      method: 'patch',
      path: `${A}/products/{id}`,
      operationId: 'updateProduct',
      summary: 'Update a product (optimistic concurrency via version)',
      ...tag('catalog'),
      request: { params: idParamsSchema, body: updateProductSchema },
      responses: { 200: { description: 'The product', schema: productSchema } },
    }),
    def('staff', {
      method: 'delete',
      path: `${A}/products/{id}`,
      operationId: 'deleteProduct',
      summary: 'Soft-delete a product',
      ...tag('catalog'),
      request: { params: idParamsSchema },
      responses: noContent,
    }),
    def('public', {
      method: 'get',
      path: `${A}/products/{id}/images`,
      operationId: 'listProductImages',
      summary: 'List product images',
      ...tag('catalog'),
      request: { params: idParamsSchema },
      responses: { 200: { description: 'Images', schema: z.array(productImageSchema) } },
    }),
    def('staff', {
      method: 'post',
      path: `${A}/products/{id}/images`,
      operationId: 'addProductImage',
      summary: 'Attach an https image URL to a product',
      ...tag('catalog'),
      request: { params: idParamsSchema, body: addImageSchema },
      responses: { 201: { description: 'Created', schema: productImageSchema } },
    }),
    def('staff', {
      method: 'delete',
      path: `${A}/products/{id}/images/{imageId}`,
      operationId: 'removeProductImage',
      summary: 'Remove a product image',
      ...tag('catalog'),
      request: { params: productImageParamsSchema },
      responses: noContent,
    }),

    def('user', {
      method: 'get',
      path: `${A}/cart`,
      operationId: 'getCart',
      summary: 'Your cart',
      ...tag('cart'),
      responses: { 200: { description: 'The cart', schema: cartSchema } },
    }),
    def('user', {
      method: 'put',
      path: `${A}/cart/items/{productId}`,
      operationId: 'setCartItem',
      summary: 'Set the quantity of a product in your cart',
      ...tag('cart'),
      request: { params: productParamsSchema, body: setCartItemSchema },
      responses: { 200: { description: 'The cart', schema: cartSchema } },
    }),
    def('user', {
      method: 'delete',
      path: `${A}/cart/items/{productId}`,
      operationId: 'removeCartItem',
      summary: 'Remove a product from your cart',
      ...tag('cart'),
      request: { params: productParamsSchema },
      responses: { 200: { description: 'The cart', schema: cartSchema } },
    }),
    def('user', {
      method: 'delete',
      path: `${A}/cart`,
      operationId: 'clearCart',
      summary: 'Empty your cart',
      ...tag('cart'),
      responses: noContent,
    }),

    def('user', {
      method: 'post',
      path: `${A}/orders`,
      operationId: 'checkout',
      summary: 'Place an order from your cart; prices and stock are settled server-side',
      ...tag('orders'),
      request: { headers: idempotencyHeaderSchema, body: checkoutSchema },
      responses: { 201: { description: 'The order', schema: orderSchema } },
    }),
    def('user', {
      method: 'get',
      path: `${A}/orders`,
      operationId: 'listOrders',
      summary: 'List your orders (staff see everyone)',
      ...tag('orders'),
      request: { query: listOrdersQuerySchema as unknown as z.ZodObject },
      responses: { 200: { description: 'A page', schema: orderPageSchema } },
    }),
    def('user', {
      method: 'get',
      path: `${A}/orders/{id}`,
      operationId: 'getOrder',
      summary: 'Get an order you own (staff: any)',
      ...tag('orders'),
      request: { params: idParamsSchema },
      responses: { 200: { description: 'The order', schema: orderSchema } },
    }),
    def('user', {
      method: 'post',
      path: `${A}/orders/{id}/cancel`,
      operationId: 'cancelOrder',
      summary: 'Cancel an unpaid order and restore its stock',
      ...tag('orders'),
      request: { params: idParamsSchema },
      responses: { 200: { description: 'The order', schema: orderSchema } },
    }),
    def('staff', {
      method: 'post',
      path: `${A}/orders/{id}/fulfill`,
      operationId: 'fulfillOrder',
      summary: 'Mark a paid order fulfilled',
      ...tag('orders'),
      request: { params: idParamsSchema },
      responses: { 200: { description: 'The order', schema: orderSchema } },
    }),
    def('user', {
      method: 'post',
      path: `${A}/orders/{id}/payments`,
      operationId: 'payOrder',
      summary: 'Pay an order you own; the amount is always the order total',
      ...tag('orders'),
      request: { params: idParamsSchema, body: createPaymentSchema },
      responses: { 201: { description: 'The payment', schema: paymentSchema } },
    }),
    def('user', {
      method: 'get',
      path: `${A}/orders/{id}/payments`,
      operationId: 'listOrderPayments',
      summary: 'Payments of an order',
      ...tag('orders'),
      request: { params: idParamsSchema },
      responses: { 200: { description: 'Payments', schema: z.array(paymentSchema) } },
    }),
  ].forEach((r) => registry.add(r));

  const doc = registry.document() as {
    paths: Record<string, Record<string, Record<string, unknown>>>;
  };
  for (const methods of Object.values(doc.paths)) {
    for (const op of Object.values(methods)) {
      const access = ACCESS_BY_OPERATION.get(op['operationId'] as string);
      if (access && access !== 'public') op['security'] = [{ bearerAuth: [] }];
    }
  }
  cached = {
    ...doc,
    components: {
      securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    },
  };
  return cached;
}

@Controller()
export class OpenApiController {
  @Public()
  @Get('openapi.json')
  document() {
    return openApiDocument();
  }
}
