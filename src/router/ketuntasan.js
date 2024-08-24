const { Router } = require("express");
const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../controller/ketuntasan-controller");

const ketuntasan = Router();

ketuntasan.get("/", list);
ketuntasan.get("/:id", getById);
ketuntasan.post("/", create);
ketuntasan.put("/:id", update);
ketuntasan.delete("/:id", remove);

module.exports = ketuntasan;
