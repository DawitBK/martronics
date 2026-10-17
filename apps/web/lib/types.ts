/** Response shapes the web app reads. The API's OpenAPI document is the source of truth. */
export type Role = 'customer' | 'manager' | 'admin';

export interface Page<T> {
  items: T[];
  page: { limit: number; offset: number; total: number };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  version: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  version: number;
}
export interface SubCategory extends Category {
  categoryId: string;
}

export interface ProductImage {
  id: string;
  url: string;
  position: number;
}
export interface Product {
  id: string;
  name: string;
  description: string;
  priceMinor: number;
  currency: string;
  stock: number;
  status: 'active' | 'archived';
  categoryId: string;
  subCategoryId: string;
  images: ProductImage[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  unitPriceMinor: number;
  quantity: number;
  lineTotalMinor: number;
  available: number;
}
export interface Cart {
  items: CartItem[];
  totalMinor: number;
  currency: string;
}

export type OrderStatus = 'pending_payment' | 'paid' | 'fulfilled' | 'cancelled';
export interface OrderItem {
  productId: string;
  productName: string;
  unitPriceMinor: number;
  quantity: number;
  lineTotalMinor: number;
}
export interface Order {
  id: string;
  number: string;
  userId: string;
  status: OrderStatus;
  totalMinor: number;
  currency: string;
  items: OrderItem[];
  version: number;
  createdAt: string;
  updatedAt: string;
}
export interface Payment {
  id: string;
  orderId: string;
  amountMinor: number;
  currency: string;
  method: string;
  status: 'pending' | 'succeeded' | 'failed';
  createdAt: string;
}
