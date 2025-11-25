import { DataTypes } from "sequelize";

export default function (sequelize) {
  const Category = sequelize.define("Category", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
  });

  Category.associate = (models) => {
    Category.hasMany(models.SubCategory, {
      foreignKey: "category_id",
      as: "SubCategories",
    });
    Category.hasMany(models.Product, {
      foreignKey: "category_id",
      as: "products",
    });
  };

  return Category;
}
