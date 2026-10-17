import { DataTypes } from "sequelize";

export default function (sequelize) {
  const Cart = sequelize.define("Cart", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, unique: true, allowNull: false },
  });

  Cart.associate = (models) => {
    Cart.belongsTo(models.User, { foreignKey: "user_id", as: "user" });

    Cart.hasMany(models.CartItem, {
      foreignKey: "cart_id",
      as: "items",
    });
  };

  return Cart;
}
