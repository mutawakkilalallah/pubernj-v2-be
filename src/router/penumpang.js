const { Router } = require("express");
const {
  statusKepulangan,
  statusRombongan,
  addDropspot,
  list,
  daftarPenumpang,
  nonaktifDropspot,
  aktifDropspot,
  addArmada,
  cetakSurat,
  cetakSuratPersonal,
  deleteArmada,
} = require("../controller/penumpang-controller");

const updrop = require("../../middleware/updrop");

const penumpang = Router();

penumpang.get("/", list);
penumpang.put("/status-kepulangan/:uuid", updrop, statusKepulangan);
penumpang.put("/status-rombongan/:uuid", updrop, statusRombongan);
penumpang.post("/daftar/:uuid", updrop, daftarPenumpang);
penumpang.post("/tujuan/:uuid", updrop, addDropspot);
penumpang.put("/tujuan/:id/nonaktif", updrop, nonaktifDropspot);
penumpang.put("/tujuan/:id/aktif", updrop, aktifDropspot);
penumpang.put("/armada/:armadaId", addArmada);
penumpang.put("/armada-hapus", deleteArmada);
penumpang.get("/cetak-surat", cetakSurat);
penumpang.get("/cetak-personal/:uuid", cetakSuratPersonal);

module.exports = penumpang;
