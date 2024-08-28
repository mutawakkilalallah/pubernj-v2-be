const { Router } = require("express");
const {
  generatePersyaratan,
  list,
} = require("../controller/persyaratan-controller");

const persyaratan = Router();

persyaratan.post("/syncronize", generatePersyaratan);
persyaratan.get("/", list);

module.exports = persyaratan;
