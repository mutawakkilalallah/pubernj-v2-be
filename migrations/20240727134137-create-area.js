"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("areas", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      namaArea: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      picInt: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      hpPicInt: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      picExt: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      hpPicExt: {
        allowNull: true,
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("areas");
  },
};
