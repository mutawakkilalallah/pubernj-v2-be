const { Router } = require("express");
const {
  generatePendamping,
  list,
  getByUuid,
  remove,
} = require("../controller/pendamping-controller");

const pendamping = Router();

pendamping.get("/", list);
pendamping.get("/:uuid", getByUuid);
pendamping.post("/", generatePendamping);
pendamping.delete("/:uuid", remove);

module.exports = pendamping;
