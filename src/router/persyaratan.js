const { Router } = require("express");
const {
  generatePersyaratan,
  list,
  tuntas,
  tuntasMobile,
} = require("../controller/persyaratan-controller");

const persyaratan = Router();

persyaratan.post("/syncronize", generatePersyaratan);
persyaratan.get("/", list);
persyaratan.put("/tuntas/:uuid", tuntas);
persyaratan.put("/tuntas-mobile/:uuid", tuntasMobile);

module.exports = persyaratan;
