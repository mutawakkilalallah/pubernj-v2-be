"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("armadas", "type", {
      type: Sequelize.ENUM,
      allowNull: false,
      values: ["bus", "minibus", "elf", "hiace", "mpv", "elflong"],
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("armadas", "type", {
      type: Sequelize.ENUM,
      allowNull: false,
      values: ["bus", "minibus", "elf", "hiace", "mpv"],
    });
  },
};
