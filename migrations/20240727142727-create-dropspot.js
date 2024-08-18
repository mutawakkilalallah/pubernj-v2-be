"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("dropspots", {
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
      harga: {
        allowNull: false,
        type: Sequelize.BIGINT,
      },
      grup: {
        allowNull: false,
        type: Sequelize.ENUM,
        values: ["jatim", "jawa-non-jatim", "luar-jawa", "luar-pulau"],
      },
      areaId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "areas",
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
    await queryInterface.dropTable("dropspots");
  },
};
