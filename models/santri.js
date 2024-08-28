"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Santri extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Santri.hasOne(models.Penumpang, {
        as: "penumpang",
        foreignKey: "santriUuid",
      });
      Santri.hasMany(models.SantriPersyaratan, {
        as: "persyaratan",
        foreignKey: "santriUuid",
      });
    }
  }
  Santri.init(
    {
      uuid: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUIDV4,
      },
      niup: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nama_lengkap: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      negara: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      provinsi: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      kecamatan: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      alias_wilayah: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wilayah: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      id_blok: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      blok: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      raw: {
        type: DataTypes.TEXT,
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
      modelName: "Santri",
      tableName: "santris",
    }
  );
  return Santri;
};
