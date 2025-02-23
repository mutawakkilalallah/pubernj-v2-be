const { Router } = require("express");
const {
  generateSantri,
  list,
  getByUuid,
  getDomisili,
  filterWilayah,
  filterBlok,
} = require("../controller/santri-controller");

const santri = Router();

// santri.post("/syncronize", generateSantri);
santri.get("/", list);
santri.get("/domisili", getDomisili);
santri.get("/:uuid", getByUuid);
santri.get("/filter/wilayah", filterWilayah);
santri.get("/filter/blok", filterBlok);

module.exports = santri;
