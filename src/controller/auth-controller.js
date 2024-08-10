const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const { User } = require("../../models");
const authSchema = require("../validation/auth-schema");
const axios = require("axios");

module.exports = {
  //   login
  login: async (req, res) => {
    try {
      const { error, value } = authSchema.login.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: error.message,
        });
      }
      // get data from database
      const user = await User.findOne({
        where: {
          username: value.username,
        },
      });
      if (!user) {
        return res.status(401).json({
          status: 401,
          message: "UNAUTHORIZED",
          error: `invalid credentials`,
        });
      }
      const validPassword = await bcrypt.compare(value.password, user.password);
      if (!validPassword) {
        return res.status(401).json({
          status: 401,
          message: "UNAUTHORIZED",
          error: `invalid credentials`,
        });
      }
      user.password = null;
      const token = await JWT.sign({ user }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
      return res.status(200).json({
        status: 200,
        message: "OK",
        token: token,
        data: user,
      });
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
  getImage: async (req, res) => {
    try {
      if (!req.params.niup) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: "niup harus di isi",
        });
      }

      const santri = await axios.get(
        `${process.env.PEDATREN_URL}/person/niup/${req.params.niup}`,
        {
          headers: {
            "x-api-key": process.env.PEDATREN_TOKEN,
          },
        }
      );

      const resp = await axios.get(
        `${process.env.PEDATREN_URL}${
          santri.data.fotodiri[req.query.size || "medium"]
        }`,
        {
          headers: {
            "x-api-key": process.env.PEDATREN_TOKEN,
          },
          responseType: "arraybuffer",
        }
      );

      res.contentType("image/jpeg").send(Buffer.from(resp.data, "binary"));
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
};
