const { Router } = require("express");
const { list } = require("../controller/pembayaran-controller");

const pembayaran = Router();

pembayaran.get("/", list);

module.exports = pembayaran;
