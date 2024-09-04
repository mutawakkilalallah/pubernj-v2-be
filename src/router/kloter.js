const { Router } = require("express");
const {
  list,
  // filter,
  getById,
  create,
  update,
  remove,
} = require("../controller/kloter-controller");

const kloter = Router();

kloter.get("/", list);
// kloter.get("/filter", filter);
kloter.get("/:id", getById);
kloter.post("/", create);
kloter.put("/:id", update);
kloter.delete("/:id", remove);

module.exports = kloter;
