const { Router } = require("express");
const {
  login,
  getImage,
  refreshToken,
} = require("../controller/auth-controller");

const auth = Router();

auth.post("/login", login);
auth.post("/refresh-token", refreshToken);
auth.get("/person/image/:niup", getImage);

module.exports = auth;
