"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Tujuans", {
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
      dropspotId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "dropspots",
          key: "id",
        },
      },
      isAktif: {
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
    await queryInterface.dropTable("Tujuans");
  },
};
