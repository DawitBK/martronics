import { DataTypes } from "sequelize";

export default function (sequelize) {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM("customer", "admin", "manager"),
      defaultValue: "customer",
    },
  });
  User.associate = (models) => {
    User.hasMany(models.Product, { foreignKey: "user_id", as: "products" });
  };
  return User;
}
// models / User.js;
// import { DataTypes } from "sequelize";

// export default function (sequelize) {
//   const User = sequelize.define("User", {
//     id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//     firstName: { type: DataTypes.STRING, allowNull: false },
//     lastName: { type: DataTypes.STRING, allowNull: false },
//     email: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true,
//       validate: { isEmail: true },
//     },
//     password: { type: DataTypes.STRING, allowNull: false },
//     role: {
//       type: DataTypes.ENUM("customer", "admin"),
//       defaultValue: "customer",
//     },
//   });

//   User.associate = (models) => {
//     User.hasMany(models.Product, { foreignKey: "user_id", as: "products" });
//   };

//   return User;
// }
