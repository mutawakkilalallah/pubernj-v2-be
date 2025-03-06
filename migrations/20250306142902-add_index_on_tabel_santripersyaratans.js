"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex(
      "santripersyaratans",
      ["santriUuid", "ketuntasanId", "status"],
      {
        name: "idx_santripersyaratans_santriUuid_ketuntasanId_status", // Nama indeks
        unique: false, // Indeks tidak unik
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex(
      "santripersyaratans",
      "idx_santripersyaratans_santriUuid_ketuntasanId_status"
    );
  },
};
