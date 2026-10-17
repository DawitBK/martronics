import { DataTypes } from "sequelize";

export default function (sequelize) {
  const Product = sequelize.define(
    "Product",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      stock: { type: DataTypes.INTEGER, defaultValue: 0 },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      category_id: { type: DataTypes.INTEGER, allowNull: false },
      sub_category_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "Products", // <-- ensure it matches your actual table name
      timestamps: true, // <-- automatically handles createdAt & updatedAt
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
    Product.belongsTo(models.Category, {
      foreignKey: "category_id",
      as: "category",
    });
    Product.belongsTo(models.SubCategory, {
      foreignKey: "sub_category_id",
      as: "subCategory",
    });
    Product.hasMany(models.ProductImage, {
      foreignKey: "product_id",
      as: "images",
    });
    Product.hasMany(models.CartItem, {
      foreignKey: "product_id",
      as: "cartItems",
    });
    Product.hasMany(models.OrderItem, {
      foreignKey: "product_id",
      as: "orderItems",
    });
  };

  return Product;
}
