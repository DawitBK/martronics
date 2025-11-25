import { DataTypes } from "sequelize";

export default function (sequelize) {
  const CartItem = sequelize.define("CartItem", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cart_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  });

  CartItem.associate = (models) => {
    CartItem.belongsTo(models.Cart, { foreignKey: "cart_id", as: "cart" });

    CartItem.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product",
    });
  };

  return CartItem;
}
