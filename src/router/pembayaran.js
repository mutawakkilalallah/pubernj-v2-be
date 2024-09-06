const { Router } = require("express");
const { list, tagihan } = require("../controller/pembayaran-controller");

const pembayaran = Router();

pembayaran.get("/", list);
pembayaran.get("/tagihan", tagihan);

module.exports = pembayaran;
