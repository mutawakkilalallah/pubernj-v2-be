const { Router } = require("express");
const {
  generatePersyaratan,
  list,
  tuntas,
} = require("../controller/persyaratan-controller");

const persyaratan = Router();

persyaratan.post("/syncronize", generatePersyaratan);
persyaratan.get("/", list);
persyaratan.put("/tuntas/:uuid", tuntas);

module.exports = persyaratan;
