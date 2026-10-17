// src/models/orderitem.js
import { DataTypes } from "sequelize";

export default function (sequelize) {
  const OrderItem = sequelize.define(
    "OrderItem",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      order_id: { type: DataTypes.INTEGER, allowNull: false },
      product_id: { type: DataTypes.INTEGER, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      price_at_purchase: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    },
    {
      tableName: "OrderItems", // matches your DB table
      timestamps: true,
    }
  );

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, { foreignKey: "order_id", as: "order" });
    OrderItem.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product",
    });
  };

  return OrderItem;
}
