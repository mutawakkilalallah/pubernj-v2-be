const { Router } = require("express");
const {
  generateSantri,
  list,
  getByUuid,
  getDomisili,
} = require("../controller/santri-controller");

const santri = Router();

santri.post("/syncronize", generateSantri);
santri.get("/", list);
santri.get("/domisili", getDomisili);
santri.get("/:uuid", getByUuid);

module.exports = santri;
