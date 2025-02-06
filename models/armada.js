"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Armada extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Armada.belongsTo(models.Dropspot, { as: "dropspot" });
      Armada.hasMany(models.Penumpang, { as: "penumpang" });
      Armada.belongsTo(models.User, { as: "user" });
    }
  }
  Armada.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      namaArmada: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ["bus", "minibus", "elf", "hiace", "mpv", "elflong"],
      },
      jenis: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ["putra", "putri"],
      },
      hargaSewa: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      isKloter: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ["Y", "T"],
        defaultValue: "T",
      },
      namaKloter: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      jadwalKeberangkatan: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      dropspotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "dropspots",
          key: "id",
        },
      },
      userUuid: {
        type: DataTypes.STRING,
        allowNull: true,
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
      modelName: "Armada",
      tableName: "armadas",
    }
  );
  return Armada;
};
