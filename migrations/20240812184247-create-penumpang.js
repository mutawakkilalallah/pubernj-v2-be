"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("penumpangs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      santriUuid: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      statusKepulangan: {
        allowNull: false,
        type: Sequelize.ENUM,
        values: ["Y", "T"],
        defaultValue: "T",
      },
      statusRombongan: {
        allowNull: false,
        type: Sequelize.ENUM,
        values: ["Y", "T"],
        defaultValue: "T",
      },
      tagihan: {
        allowNull: false,
        type: Sequelize.BIGINT,
        defaultValue: 0,
      },
      totalBayar: {
        allowNull: false,
        type: Sequelize.BIGINT,
        defaultValue: 0,
      },
      statusPembayaran: {
        allowNull: false,
        type: Sequelize.ENUM,
        values: ["belum-lunas", "kurang", "lunas", "lebih"],
        defaultValue: "belum-lunas",
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
    await queryInterface.dropTable("penumpangs");
  },
};
