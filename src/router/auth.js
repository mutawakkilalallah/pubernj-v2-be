const { Router } = require("express");
const {
  login,
  getImage,
  refreshToken,
  loginWs,
  getByCard,
} = require("../controller/auth-controller");

const auth = Router();

auth.post("/walisantri/login", loginWs);
auth.post("/login", login);
auth.post("/refresh-token", refreshToken);
auth.get("/person/image/:niup", getImage);
auth.get("/person/card/:tag", getByCard);

module.exports = auth;
