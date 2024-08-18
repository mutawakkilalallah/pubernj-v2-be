"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Tujuan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Tujuan.belongsTo(models.Dropspot, { as: "dropspot" });
    }
  }
  Tujuan.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      penumpangId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: "penumpangs",
          key: "id",
        },
      },
      dropspotId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: "dropspots",
          key: "id",
        },
      },
      isAktif: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ["Y", "T"],
        defaultValue: "Y",
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
      modelName: "Tujuan",
      tableName: "tujuans",
    }
  );
  return Tujuan;
};
