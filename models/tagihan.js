"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Tagihan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Tagihan.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      santriUuid: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      tagihan: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      totalBayar: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      status: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ["lunas", "belum-lunas"],
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
      modelName: "Tagihan",
      tableName: "tagihans",
    }
  );
  return Tagihan;
};
