const { Router } = require("express");
const { byDropspotPaPi } = require("../controller/stats-controller");

const stats = Router();

stats.get("/penumpang/by-dropspot", byDropspotPaPi);

module.exports = stats;
