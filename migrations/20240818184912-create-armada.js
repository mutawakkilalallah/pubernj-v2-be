"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("armadas", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      namaArmada: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM,
        allowNull: false,
        values: ["bus", "minibus", "elf", "hiace", "mpv"],
      },
      jenis: {
        type: Sequelize.ENUM,
        allowNull: false,
        values: ["putra", "putri"],
      },
      hargaSewa: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      dropspotId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "dropspots",
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
    await queryInterface.dropTable("armadas");
  },
};
