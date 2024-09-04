"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("ketuntasans", "isAktif", {
      type: Sequelize.ENUM,
      allowNull: false,
      values: ["Y", "T"],
      defaultValue: "Y",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("ketuntasans", "isAktif");
  },
};
