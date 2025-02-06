const { Router } = require("express");
const {
  list,
  tagihan,
  uploadTagihan,
} = require("../controller/pembayaran-controller");
const uploadMlt = require("../../middleware/muter");

const pembayaran = Router();

pembayaran.get("/", list);
pembayaran.get("/tagihan", tagihan);
pembayaran.post(
  "/upload-tagihan",
  uploadMlt.single("excelFile"),
  uploadTagihan
);

module.exports = pembayaran;
