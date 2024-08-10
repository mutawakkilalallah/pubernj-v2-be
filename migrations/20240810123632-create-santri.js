"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Santris", {
      uuid: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      niup: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      nama_lengkap: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      negara: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      provinsi: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      kecamatan: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      alias_wilayah: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      wilayah: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      id_blok: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      blok: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      raw: {
        type: Sequelize.TEXT,
        allowNull: true,
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
    await queryInterface.dropTable("Santris");
  },
};
