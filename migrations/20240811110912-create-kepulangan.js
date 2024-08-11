"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Kepulangans", {
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
      },
      statusRombongan: {
        allowNull: false,
        type: Sequelize.ENUM,
        values: ["Y", "T"],
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
    await queryInterface.dropTable("Kepulangans");
  },
};
