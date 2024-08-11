"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Tagihans", {
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
      tagihan: {
        allowNull: false,
        type: Sequelize.BIGINT,
      },
      totalBayar: {
        allowNull: false,
        type: Sequelize.BIGINT,
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM,
        values: ["lunas", "belum-lunas"],
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
    await queryInterface.dropTable("Tagihans");
  },
};
