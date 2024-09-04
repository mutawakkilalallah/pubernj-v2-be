"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Ketuntasan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Ketuntasan.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      nama: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      alias: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      statusTrue: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      statusFalse: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      penjab: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      isAktif: {
        type: DataTypes.ENUM,
        allowNull: false,
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
      modelName: "Ketuntasan",
      tableName: "ketuntasans",
    }
  );
  return Ketuntasan;
};
