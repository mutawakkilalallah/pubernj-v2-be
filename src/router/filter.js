const { Router } = require("express");
const {
  negara,
  provinsi,
  kabupaten,
  kecamatan,
} = require("../controller/filter-controller");

const filter = Router();

filter.get("/negara", negara);
filter.get("/provinsi", provinsi);
filter.get("/kabupaten", kabupaten);
filter.get("/kecamatan", kecamatan);

module.exports = filter;
