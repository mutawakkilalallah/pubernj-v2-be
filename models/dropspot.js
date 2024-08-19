"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Dropspot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Dropspot.belongsTo(models.Area, { as: "area" });
    }
  }
  Dropspot.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      namaDropspot: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      cakupan: {
        allowNull: true,
        type: DataTypes.TEXT,
      },
      harga: {
        allowNull: true,
        type: DataTypes.BIGINT,
      },
      grup: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ["jatim", "jawa-non-jatim", "luar-jawa", "luar-pulau"],
      },
      areaId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: "Areas",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Dropspot",
      tableName: "dropspots",
    }
  );
  return Dropspot;
};
