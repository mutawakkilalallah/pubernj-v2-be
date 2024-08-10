const { Router } = require("express");
const {
  generateSantri,
  list,
  getByUuid,
} = require("../controller/santri-controller");

const santri = Router();

santri.post("/syncronize", generateSantri);
santri.get("/", list);
santri.get("/:uuid", getByUuid);

module.exports = santri;
