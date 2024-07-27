const { Router } = require("express");
const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../controller/area-controller");

const area = Router();

area.get("/", list);
area.get("/:id", getById);
area.post("/", create);
area.put("/:id", update);
area.delete("/:id", remove);

module.exports = area;
