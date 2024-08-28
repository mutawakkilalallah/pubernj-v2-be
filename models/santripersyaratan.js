"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SantriPersyaratan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      SantriPersyaratan.belongsTo(models.Ketuntasan, { as: "ketuntasan" });
    }
  }
  SantriPersyaratan.init(
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
      ketuntasanId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: "ketuntasans",
          key: "id",
        },
      },
      status: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      modelName: "SantriPersyaratan",
      tableName: "santripersyaratans",
    }
  );
  return SantriPersyaratan;
};
