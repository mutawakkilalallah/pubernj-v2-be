"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Ticket extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Ticket.belongsTo(models.Penumpang, {
        as: "penumpang",
        foreignKey: "penumpangId",
      });
      Ticket.belongsTo(models.Armada, { as: "kloter", foreignKey: "kloterId" });
      Ticket.belongsTo(models.Transportasi, {
        as: "transportasi",
        foreignKey: "transportasiId",
      });
      Ticket.belongsTo(models.Rute, {
        as: "ruteAwal",
        foreignKey: "ruteAwalId",
      });
      Ticket.belongsTo(models.Rute, {
        as: "ruteAkhir",
        foreignKey: "ruteAkhirId",
      });
    }
  }
  Ticket.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      jadwalTiket: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      hargaTiket: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      berkasTiket: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      pembayaranTiket: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ["lunas", "belum-lunas"],
        defaultValue: "belum-lunas",
      },
      penumpangId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: "penumpangs",
          key: "id",
        },
      },
      kloterId: {
        allowNull: true,
        type: DataTypes.INTEGER,
        references: {
          model: "armadas",
          key: "id",
        },
      },
      transportasiId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: "transportasis",
          key: "id",
        },
      },
      ruteAwalId: {
        allowNull: true,
        type: DataTypes.INTEGER,
        references: {
          model: "rutes",
          key: "id",
        },
      },
      ruteAkhirId: {
        allowNull: true,
        type: DataTypes.INTEGER,
        references: {
          model: "rutes",
          key: "id",
        },
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
      modelName: "Ticket",
      tableName: "tickets",
    }
  );
  return Ticket;
};
