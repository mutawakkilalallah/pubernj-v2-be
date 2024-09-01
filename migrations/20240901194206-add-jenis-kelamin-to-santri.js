"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("santris", "jenis_kelamin", {
      type: Sequelize.ENUM,
      allowNull: false,
      values: ["L", "P"],
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("santris", "jenis_kelamin");
  },
};
