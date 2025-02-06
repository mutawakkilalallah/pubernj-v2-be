const { Router } = require("express");
const {
  generatePendamping,
  list,
  getByUuid,
  remove,
  update,
} = require("../controller/pendamping-controller");

const pendamping = Router();

pendamping.get("/", list);
pendamping.get("/:uuid", getByUuid);
pendamping.post("/", generatePendamping);
pendamping.put("/:uuid", update);
pendamping.delete("/:uuid", remove);

module.exports = pendamping;
