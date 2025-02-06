const { Op, fn, col } = require("sequelize");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const { User, Santri, RefreshToken, sequelize } = require("../../models");
const authSchema = require("../validation/auth-schema");
const axios = require("axios");

module.exports = {
  //   login
  loginWs: async (req, res) => {
    try {
      const { error, value } = authSchema.loginWs.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: error.message,
        });
      }

      const pwdResult = value.password.replace(
        /(\d{4})(\d{2})(\d{2})/,
        "$1-$2-$3"
      );

      // get data from database
      const user = await User.findOne({
        where: {
          username: value.username,
        },
      });

      if (!user) {
        console.log("buat dulu");
        const santri = await Santri.findOne({
          where: {
            niup: value.username,
            [Op.and]: [
              sequelize.literal(
                `JSON_EXTRACT(raw, '$.tanggal_lahir') = '${pwdResult}'`
              ),
            ],
          },
        });

        if (!santri) {
          return res.status(404).json({
            status: 404,
            message: "NOT FOUND",
            error: `tidak ditemukan santri dengan niup tersebut`,
          });
        }

        value.password = await bcrypt.hashSync(value.password, 12);
        const userGenerated = {
          uuid: santri.uuid,
          nama_lengkap: santri.nama_lengkap,
          niup: value.username,
          jenis_kelamin: santri.jenis_kelamin,
          username: value.username,
          password: value.password,
          role: "walisantri",
        };

        const result = await User.create(userGenerated);
        result.password = null;

        const tokenGenerated = await JWT.sign(
          { user },
          process.env.SECRET_KEY,
          {
            expiresIn: "30m",
          }
        );

        const refreshTokenGenerated = await JWT.sign(
          { uuid: userGenerated.uuid },
          process.env.SECRET_KEY
        );

        await RefreshToken.create({
          token: refreshTokenGenerated,
        });
        return res.status(200).json({
          status: 200,
          message: "OK",
          token: tokenGenerated,
          refreshToken: refreshTokenGenerated,
          data: result,
        });
      } else {
        console.log("langsung saja");

        const validPassword = await bcrypt.compare(
          value.password,
          user.password
        );
        if (!validPassword) {
          return res.status(401).json({
            status: 401,
            message: "UNAUTHORIZED",
            error: `invalid credentials`,
          });
        }

        user.password = null;

        const token = await JWT.sign({ user }, process.env.SECRET_KEY, {
          expiresIn: "30m",
        });

        const refreshToken = await JWT.sign(
          { uuid: user.uuid },
          process.env.SECRET_KEY
        );

        await RefreshToken.create({
          token: refreshToken,
        });

        return res.status(200).json({
          status: 200,
          message: "OK",
          token: token,
          refreshToken: refreshToken,
          data: user,
        });
      }
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
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
        expiresIn: "12h",
      });
      const refreshToken = await JWT.sign(
        { uuid: user.uuid },
        process.env.SECRET_KEY
      );
      await RefreshToken.create({
        token: refreshToken,
      });
      return res.status(200).json({
        status: 200,
        message: "OK",
        token: token,
        refreshToken: refreshToken,
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
  //   refreshToken
  refreshToken: async (req, res) => {
    try {
      const { error, value } = authSchema.refreshToken.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: error.message,
        });
      }
      const storedToken = await RefreshToken.findOne({
        where: {
          token: value.token,
        },
      });
      const decoded = JWT.verify(value.token, process.env.SECRET_KEY);
      if (storedToken && !storedToken.expired && decoded.uuid) {
        // get data from database
        const user = await User.findOne({
          where: {
            uuid: decoded.uuid,
          },
        });
        if (!user) {
          return res.status(401).json({
            status: 401,
            message: "UNAUTHORIZED",
            error: `invalid credentials`,
          });
        }
        const token = await JWT.sign({ user }, process.env.SECRET_KEY, {
          expiresIn: "12h",
        });
        const refreshToken = await JWT.sign(
          { uuid: user.uuid },
          process.env.SECRET_KEY
        );
        await storedToken.update({ expired: true });
        await RefreshToken.create({
          token: refreshToken,
        });
        return res.status(200).json({
          status: 200,
          message: "OK",
          token: token,
          refreshToken: refreshToken,
          data: user,
        });
      } else {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: "something went wrong",
        });
      }
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
      if (req.params.niup.length != 11) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: "format niup tidak sesuai",
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
  getByCard: async (req, res) => {
    try {
      if (!req.params.tag) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: "tag harus di isi",
        });
      }

      const resp = await axios.get(
        `${process.env.PEDATREN_URL}/person/card/${req.params.tag}`,
        {
          headers: {
            "x-api-key": process.env.PEDATREN_TOKEN,
          },
        }
      );

      res.status(200).json({
        status: 200,
        message: "OK",
        data: resp.data,
      });
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
};
