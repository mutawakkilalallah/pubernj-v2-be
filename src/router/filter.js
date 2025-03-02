const { Router } = require("express");
const {
  negara,
  provinsi,
  kabupaten,
  kecamatan,
  wilayah,
  blok,
} = require("../controller/filter-controller");

const filter = Router();

filter.get("/negara", negara);
filter.get("/provinsi", provinsi);
filter.get("/kabupaten", kabupaten);
filter.get("/kecamatan", kecamatan);
filter.get("/wilayah", wilayah);
filter.get("/blok", blok);

module.exports = filter;
