const { Router } = require("express");
const {
  statusKepulangan,
  statusRombongan,
  addDropspot,
  list,
} = require("../controller/penumpang-controller");

const penumpang = Router();

penumpang.get("/", list);
// penumpang.get("/:id", getById);
penumpang.put("/status-kepulangan/:uuid", statusKepulangan);
penumpang.put("/status-rombongan/:uuid", statusRombongan);
penumpang.post("/tujuan/:uuid", addDropspot);
// penumpang.delete("/:id", remove);

module.exports = penumpang;
