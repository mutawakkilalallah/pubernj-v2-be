"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      uuid: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      nama_lengkap: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      niup: {
        allowNull: false,
        type: Sequelize.BIGINT,
      },
      jenis_kelamin: {
        allowNull: false,
        type: Sequelize.ENUM,
        values: ["L", "P"],
      },
      id_blok: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      blok: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      alias_wilayah: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      wilayah: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      username: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      role: {
        allowNull: false,
        type: Sequelize.ENUM,
        values: ["sysadmin", "admin", "supervisor", "wilayah", "daerah"],
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
    await queryInterface.dropTable("users");
  },
};
