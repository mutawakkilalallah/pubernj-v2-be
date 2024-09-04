const JWT = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  const token = req.headers["x-auth"];
  JWT.verify(token, process.env.SECRET_KEY, function (err, decoded) {
    if (err) {
      return res.status(401).json({
        status: 401,
        message: "UNAUTORIZED",
        error: "invalid credentials",
      });
    }
    req.user = decoded.user;
    next();
  });
};
