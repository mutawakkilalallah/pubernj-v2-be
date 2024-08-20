"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("users", "role", {
      allowNull: false,
      type: Sequelize.ENUM,
      values: [
        "sysadmin",
        "admin",
        "supervisor",
        "wilayah",
        "daerah",
        "pendamping",
        "armada",
        "bps",
        "keuangan",
        "p4nj",
      ],
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("users", "role", {
      allowNull: false,
      type: Sequelize.ENUM,
      values: ["sysadmin", "admin", "supervisor", "wilayah", "daerah"],
    });
  },
};
