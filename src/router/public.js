const { Router } = require("express");
const { getByNiup } = require("../controller/santri-controller");

const public = Router();

public.get("/santri/:niup", getByNiup);

module.exports = public;
