const { Router } = require("express");
const {
  generateSantri,
  list,
  getByUuid,
  daftarRombongan,
} = require("../controller/santri-controller");

const santri = Router();

santri.post("/syncronize", generateSantri);
santri.get("/", list);
santri.get("/:uuid", getByUuid);
santri.post("/daftar-rombongan/:uuid", daftarRombongan);

module.exports = santri;
