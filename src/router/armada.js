const { Router } = require("express");
const {
  list,
  // filter,
  getById,
  create,
  update,
  remove,
} = require("../controller/armada-controller");
const {
  addArmada,
  deleteArmada,
} = require("../controller/pendamping-controller");

const armada = Router();

armada.get("/", list);
// armada.get("/filter", filter);
armada.get("/:id", getById);
armada.post("/", create);
armada.put("/:id", update);
armada.delete("/:id", remove);
armada.put("/pendamping/:id/:uuid", addArmada);
armada.put("/pendamping-hapus/:id", deleteArmada);

module.exports = armada;
