const { Router } = require("express");
const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../controller/transport-controller");

const transport = Router();

transport.get("/", list);
transport.get("/:id", getById);
transport.post("/", create);
transport.put("/:id", update);
transport.delete("/:id", remove);

module.exports = transport;
