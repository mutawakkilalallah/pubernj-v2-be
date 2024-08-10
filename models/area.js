"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Area extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Area.hasMany(models.Dropspot, { as: "dropspot" });
    }
  }
  Area.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      namaArea: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      picInt: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      hpPicInt: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      picExt: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      hpPicExt: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "Area",
      tableName: "areas",
    }
  );
  return Area;
};
