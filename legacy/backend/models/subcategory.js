import { DataTypes } from "sequelize";

export default function (sequelize) {
  const SubCategory = sequelize.define("SubCategory", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    category_id: { type: DataTypes.INTEGER, allowNull: false },
  });

  SubCategory.associate = (models) => {
    SubCategory.belongsTo(models.Category, {
      foreignKey: "category_id",
      as: "category",
    });

    SubCategory.hasMany(models.Product, {
      foreignKey: "sub_category_id",
      as: "products",
    });
  };

  return SubCategory;
}
