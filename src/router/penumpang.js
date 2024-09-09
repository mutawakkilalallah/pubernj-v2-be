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
} = require("../controller/penumpang-controller");

const penumpang = Router();

penumpang.get("/", list);
penumpang.put("/status-kepulangan/:uuid", statusKepulangan);
penumpang.put("/status-rombongan/:uuid", statusRombongan);
penumpang.post("/daftar/:uuid", daftarPenumpang);
penumpang.post("/tujuan/:uuid", addDropspot);
penumpang.put("/tujuan/:id/nonaktif", nonaktifDropspot);
penumpang.put("/tujuan/:id/aktif", aktifDropspot);
penumpang.put("/armada/:armadaId", addArmada);
penumpang.get("/cetak-surat", cetakSurat);
penumpang.get("/cetak-personal/:uuid", cetakSuratPersonal);

module.exports = penumpang;
