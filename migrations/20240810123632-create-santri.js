"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "santris",
      {
        uuid: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
        },
        nama_lengkap: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        tempat_lahir: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        tanggal_lahir: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        jenis_kelamin: {
          type: Sequelize.ENUM,
          allowNull: false,
          values: ["L", "P"],
        },
        kecamatan: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        kabupaten: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        provinsi: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        negara: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        niup: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        foto_sm: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        foto_md: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        foto_lg: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        wilayah: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        alias_wilayah: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        blok: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        id_blok: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        kamar: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        id_kamar: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        lembaga: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        id_lembaga: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        jurusan: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        id_jurusan: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        raw: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        sync_time: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {
        indexes: [
          {
            name: "key_index",
            fields: [
              "alias_wilayah",
              "id_blok",
              "id_kamar",
              "id_lembaga",
              "id_jurusan",
            ],
            unique: false,
          },
          {
            name: "label_index",
            fields: ["wilayah", "blok", "kamar", "lembaga", "jurusan"],
            unique: false,
          },
        ],
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("santris");
  },
};
