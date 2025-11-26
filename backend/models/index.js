// src/models/index.js
import dotenv from "dotenv";
dotenv.config();

import { Sequelize } from "sequelize";
// import models, { sequelize } from "../models/index.js";

// Import models
import User from "./user.js";
import Category from "./category.js";
import SubCategory from "./subcategory.js";
import Product from "./product.js";
import ProductImage from "./productimage.js";
import Cart from "./cart.js";
import CartItem from "./cartitem.js";
import Order from "./order.js";
import OrderItem from "./orderitem.js";
import Payment from "./payment.js";

// Initialize Sequelize - support both DATABASE_URL (production) and individual vars (local)
let sequelize;

if (process.env.DATABASE_URL) {
  // Production: use DATABASE_URL with SSL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Local development: use individual env vars
  const requiredVars = ["DB_NAME", "DB_USER", "DB_PASSWORD", "DB_HOST", "DB_PORT"];
  for (const v of requiredVars) {
    if (!process.env[v]) {
      throw new Error(`Missing environment variable: ${v} (or set DATABASE_URL for production)`);
    }
  }

  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: "postgres",
      logging: false,
    }
  );
}

// Initialize models
const models = {
  User: User(sequelize),
  Category: Category(sequelize),
  SubCategory: SubCategory(sequelize),
  Product: Product(sequelize),
  ProductImage: ProductImage(sequelize),
  Cart: Cart(sequelize),
  CartItem: CartItem(sequelize),
  Order: Order(sequelize),
  OrderItem: OrderItem(sequelize),
  Payment: Payment(sequelize),
};

// Run associations
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

// Export
models.sequelize = sequelize;
export { sequelize };
export default models;
