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
      // define association here
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
      santriUuid: {
        allowNull: false,
        type: DataTypes.UUID,
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
