// src/models/order.js
import { DataTypes } from "sequelize";

export default function (sequelize) {
  const Order = sequelize.define(
    "Order",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      status: { type: DataTypes.STRING, defaultValue: "pending" }, // pending, paid, failed
    },
    {
      tableName: "Orders", // optional, default will be pluralized
      timestamps: true,
    }
  );

  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
    Order.hasMany(models.OrderItem, {
      foreignKey: "order_id",
      as: "orderItems",
    });
    Order.hasMany(models.Payment, { foreignKey: "order_id", as: "payments" });
  };

  return Order;
}
