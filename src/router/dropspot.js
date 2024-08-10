const { Router } = require("express");
const {
  list,
  filter,
  getById,
  create,
  update,
  remove,
} = require("../controller/dropspot-controller");

const dropspot = Router();

dropspot.get("/", list);
dropspot.get("/filter", filter);
dropspot.get("/:id", getById);
dropspot.post("/", create);
dropspot.put("/:id", update);
dropspot.delete("/:id", remove);

module.exports = dropspot;
