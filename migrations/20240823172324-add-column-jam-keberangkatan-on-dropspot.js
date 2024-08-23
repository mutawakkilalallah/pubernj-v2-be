"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("dropspots", "jadwalKeberangkatan", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: "2024-09-12 06:00:00",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("dropspots", "jadwalKeberangkatan");
  },
};
