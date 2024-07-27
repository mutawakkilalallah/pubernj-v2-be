"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Dropspots", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      namaDropspot: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      cakupan: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      tglBerangkatPutra: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      tglBerangkatPutri: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      // jamBerangkatPutra: {
      //   allowNull: true,
      //   type: Sequelize.TIME,
      // },
      // jamBerangkatPutri: {
      //   allowNull: true,
      //   type: Sequelize.TIME,
      // },
      areaId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Areas",
          key: "id",
        },
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
    await queryInterface.dropTable("Dropspots");
  },
};
