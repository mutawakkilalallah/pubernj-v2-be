const { Router } = require("express");
const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../controller/rute-controller");

const rute = Router();

rute.get("/", list);
rute.get("/:id", getById);
rute.post("/", create);
rute.put("/:id", update);
rute.delete("/:id", remove);

module.exports = rute;
