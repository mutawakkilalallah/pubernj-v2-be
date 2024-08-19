const { Router } = require("express");
const { login, getImage } = require("../controller/auth-controller");

const auth = Router();

auth.post("/login", login);
auth.get("/person/image/:niup", getImage);

module.exports = auth;
