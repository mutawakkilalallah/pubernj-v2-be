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
      tglBerangkatPutra: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      tglBerangkatPutri: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      // jamBerangkatPutra: {
      //   allowNull: true,
      //   type: DataTypes.TIME,
      // },
      // jamBerangkatPutri: {
      //   allowNull: true,
      //   type: DataTypes.TIME,
      // },
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
