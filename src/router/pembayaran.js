const { Router } = require("express");
const {
  list,
  tagihan,
  uploadTagihan,
} = require("../controller/pembayaran-controller");
// Konfigurasi Multer untuk menyimpan file yang diunggah
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const pembayaran = Router();

pembayaran.get("/", list);
pembayaran.get("/tagihan", tagihan);
pembayaran.post("/upload-tagihan", upload.single("excelFile"), uploadTagihan);

module.exports = pembayaran;
