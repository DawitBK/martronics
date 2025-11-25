import { DataTypes } from "sequelize";

export default function (sequelize) {
  const ProductImage = sequelize.define("ProductImage", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    url: { type: DataTypes.STRING, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
  });

  ProductImage.associate = (models) => {
    ProductImage.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product",
    });
  };

  return ProductImage;
}
