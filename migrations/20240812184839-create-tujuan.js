"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tujuans", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      penumpangId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "penumpangs",
          key: "id",
        },
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
        defaultValue: "Y",
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
    await queryInterface.dropTable("tujuans");
  },
};
