"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("armadas", "isKloter", {
      type: Sequelize.ENUM,
      allowNull: false,
      values: ["Y", "T"],
      defaultValue: "T",
    });
    await queryInterface.addColumn("armadas", "namaKloter", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("armadas", "jadwalKeberangkatan", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("armadas", "isKloter");
    await queryInterface.removeColumn("armadas", "namaKloter");
    await queryInterface.removeColumn("armadas", "jadwalKeberangkatan");
  },
};
