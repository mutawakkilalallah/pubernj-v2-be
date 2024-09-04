const { Router } = require("express");
const {
  create,
  update,
  updatePassword,
  remove,
  list,
} = require("../controller/user-controller");

const user = Router();

user.get("/", list);
user.post("/", create);
user.put("/:uuid", update);
user.put("/password/:uuid", updatePassword);
user.delete("/:uuid", remove);

module.exports = user;
