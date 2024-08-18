const { Router } = require("express");
const {
  list,
  // filter,
  getById,
  create,
  update,
  remove,
} = require("../controller/armada-controller");

const armada = Router();

armada.get("/", list);
// armada.get("/filter", filter);
armada.get("/:id", getById);
armada.post("/", create);
armada.put("/:id", update);
armada.delete("/:id", remove);

module.exports = armada;
