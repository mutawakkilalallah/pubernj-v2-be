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
      Santri.hasMany(models.SantriPersyaratan, {
        as: "kamtib",
        foreignKey: "santriUuid",
      });
      Santri.hasMany(models.SantriPersyaratan, {
        as: "fa",
        foreignKey: "santriUuid",
      });
      Santri.hasMany(models.SantriPersyaratan, {
        as: "bps",
        foreignKey: "santriUuid",
      });
      Santri.hasMany(models.SantriPersyaratan, {
        as: "kosmara",
        foreignKey: "santriUuid",
      });
    }
  }
  Santri.init(
    {
      uuid: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
      },
      nama_lengkap: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tempat_lahir: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tanggal_lahir: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      jenis_kelamin: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ["L", "P"],
      },
      kecamatan: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      kabupaten: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      provinsi: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      negara: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      niup: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      foto_sm: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      foto_md: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      foto_lg: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      wilayah: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      alias_wilayah: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      blok: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      id_blok: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      kamar: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      id_kamar: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      lembaga: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      id_lembaga: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      jurusan: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      id_jurusan: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      raw: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      sync_time: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      createdAt: {
        field: "created_at",
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        field: "updated_at",
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
