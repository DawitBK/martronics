import { DataTypes } from "sequelize";

export default function (sequelize) {
  const Payment = sequelize.define("Payment", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    method: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: "pending" }, // pending, success, failed
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Order, { foreignKey: "order_id", as: "order" });
    Payment.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
  };

  return Payment;
}
