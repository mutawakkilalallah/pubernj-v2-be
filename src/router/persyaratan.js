const { Router } = require("express");
const {
  generatePersyaratan,
  list,
  tuntas,
  tuntasMobile,
  download,
  upload,
} = require("../controller/persyaratan-controller");
const uploadMlt = require("../../middleware/muter");

const persyaratan = Router();

persyaratan.post("/syncronize", generatePersyaratan);
persyaratan.get("/", list);
persyaratan.put("/tuntas/:uuid", tuntas);
persyaratan.put("/tuntas-mobile/:uuid", tuntasMobile);
persyaratan.get("/download/:alias", download);
persyaratan.post("/upload/:alias", uploadMlt.single("excelFile"), upload);

module.exports = persyaratan;
