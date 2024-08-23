const { Router } = require("express");
const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../controller/ticket-controller");

const ticket = Router();

ticket.get("/", list);
ticket.get("/:id", getById);
ticket.post("/", create);
ticket.put("/:id", update);
ticket.delete("/:id", remove);

module.exports = ticket;
