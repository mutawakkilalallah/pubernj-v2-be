"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Armada, { as: "armada" });
    }
  }
  User.init(
    {
      uuid: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      nama_lengkap: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      niup: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      jenis_kelamin: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ["L", "P"],
      },
      id_blok: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      blok: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      alias_wilayah: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      wilayah: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      username: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      hp: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      role: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: [
          "sysadmin",
          "admin",
          "supervisor",
          "wilayah",
          "daerah",
          "pendamping",
          "armada",
          "bps",
          "keuangan",
          "ebekal",
          "p4nj",
          "walisantri",
        ],
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
      modelName: "User",
      tableName: "users",
    }
  );
  return User;
};
