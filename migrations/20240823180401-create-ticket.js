"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tickets", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      jadwalTiket: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      hargaTiket: {
        allowNull: false,
        type: Sequelize.BIGINT,
      },
      berkasTiket: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      pembayaranTiket: {
        allowNull: false,
        type: Sequelize.ENUM,
        values: ["lunas", "belum-lunas"],
        defaultValue: "belum-lunas",
      },
      penumpangId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "penumpangs",
          key: "id",
        },
      },
      kloterId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "armadas",
          key: "id",
        },
      },
      transportasiId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "transportasis",
          key: "id",
        },
      },
      ruteAwalId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "rutes",
          key: "id",
        },
      },
      ruteAkhirId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "rutes",
          key: "id",
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tickets");
  },
};
