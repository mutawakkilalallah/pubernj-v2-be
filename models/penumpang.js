"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Penumpang extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Penumpang.hasMany(models.Tujuan, { as: "tujuan" });
      // Penumpang.belongsTo(models.Santri, { as: "santri" });
    }
  }
  Penumpang.init(
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
      statusKepulangan: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ["Y", "T"],
        defaultValue: "T",
      },
      statusRombongan: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ["Y", "T"],
        defaultValue: "T",
      },
      tagihan: {
        allowNull: false,
        type: DataTypes.BIGINT,
        defaultValue: 0,
      },
      totalBayar: {
        allowNull: false,
        type: DataTypes.BIGINT,
        defaultValue: 0,
      },
      statusPembayaran: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ["belum-lunas", "kurang", "lunas", "lebih"],
        defaultValue: "belum-lunas",
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
      modelName: "Penumpang",
      tableName: "penumpangs",
    }
  );
  return Penumpang;
};
