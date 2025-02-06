const { Op } = require("sequelize");
const { User, Armada } = require("../../models");
const axios = require("axios");
const userSchema = require("../validation/user-schema");
const bcrypt = require("bcrypt");

module.exports = {
  // list all data
  list: async (req, res) => {
    try {
      // define params for filter and pagination
      const search = req.query.cari || "";
      const page = req.query.page || 1;
      const limit = parseInt(req.query.limit) || 25;
      const offset = 0 + (page - 1) * limit;
      // get data from database
      const data = await User.findAndCountAll({
        attributes: { exclude: ["password"] },
        where: {
          [Op.and]: {
            [Op.or]: {
              nama_lengkap: {
                [Op.like]: `%${search}%`,
              },
              niup: {
                [Op.like]: `%${search}%`,
              },
            },
          },
        },
        include: {
          model: Armada,
          as: "armada",
        },
        limit,
        offset,
      });
      return res
        .status(200)
        .set({
          x_total_data: data.count,
          x_total_page: Math.ceil(data.count / limit),
          x_page_limit: limit,
          x_current_page: page,
        })
        .json({
          status: 200,
          message: "OK",
          data: data.rows,
        });
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
  create: async (req, res) => {
    try {
      const { error, value } = userSchema.create.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: error.message,
        });
      }
      if (value.password != value.passwordConfirmation) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: "konfirmasi password tidak sesuai",
        });
      }
      if (value.niup.toString().length != 11) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: "format niup tidak valid",
        });
      }
      const response = await axios.get(
        `${process.env.PEDATREN_URL}/person/niup/${value.niup}`,
        {
          headers: {
            "x-api-key": process.env.PEDATREN_TOKEN,
          },
        }
      );
      const existUser = await User.findAll({
        where: {
          [Op.or]: {
            username: value.username,
            uuid: response.data.uuid,
          },
        },
      });
      console.log(existUser);
      if (existUser.length >= 1) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: "user dengan uuid atau username tersebut sudah terdaftar",
        });
      }
      value.password = await bcrypt.hashSync(value.password, 12);
      const user = {
        uuid: response.data.uuid,
        nama_lengkap: response.data.nama_lengkap,
        niup: value.niup,
        jenis_kelamin: response.data.jenis_kelamin,
        username: value.username,
        password: value.password,
        role: value.role,
      };
      if (value.role === "wilayah") {
        user.wilayah = response.data.domisili_santri
          ? response.data.domisili_santri[
              response.data.domisili_santri.length - 1
            ].wilayah
          : null;
        user.alias_wilayah = response.data.domisili_santri
          ? response.data.domisili_santri[
              response.data.domisili_santri.length - 1
            ].wilayah
              .toLowerCase()
              .replace(/ /g, "-")
          : null;
      } else if (value.role === "daerah") {
        user.wilayah = response.data.domisili_santri
          ? response.data.domisili_santri[
              response.data.domisili_santri.length - 1
            ].wilayah
          : null;
        user.alias_wilayah = response.data.domisili_santri
          ? response.data.domisili_santri[
              response.data.domisili_santri.length - 1
            ].wilayah
              .toLowerCase()
              .replace(/ /g, "-")
          : null;
        user.blok = response.data.domisili_santri
          ? response.data.domisili_santri[
              response.data.domisili_santri.length - 1
            ].blok
          : null;
        user.id_blok = response.data.domisili_santri
          ? response.data.domisili_santri[
              response.data.domisili_santri.length - 1
            ].id_blok
          : null;
      }
      const result = await User.create(user);

      return res.status(201).json({
        status: 201,
        message: "CREATED",
        result,
      });
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
  update: async (req, res) => {
    try {
      const data = await User.findOne({
        where: {
          uuid: req.params.uuid,
        },
      });
      if (!data) {
        return res.status(404).json({
          status: 404,
          message: "NOT FOUND",
          error: "user tidak di temukan",
        });
      }
      const { error, value } = userSchema.update.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: error.message,
        });
      }
      if (data.niup.toString().length != 11) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: "format niup tidak valid",
        });
      }
      const response = await axios.get(
        `${process.env.PEDATREN_URL}/person/niup/${data.niup}`,
        {
          headers: {
            "x-api-key": process.env.PEDATREN_TOKEN,
          },
        }
      );
      const user = {
        nama_lengkap: response.data.nama_lengkap,
        jenis_kelamin: response.data.jenis_kelamin,
        username: value.username,
        role: value.role,
      };
      if (value.role === "wilayah") {
        user.wilayah = response.data.domisili_santri
          ? response.data.domisili_santri[
              response.data.domisili_santri.length - 1
            ].wilayah
          : null;
        user.alias_wilayah = response.data.domisili_santri
          ? response.data.domisili_santri[
              response.data.domisili_santri.length - 1
            ].wilayah
              .toLowerCase()
              .replace(/ /g, "-")
          : null;
      } else if (value.role === "daerah") {
        user.wilayah = response.data.domisili_santri
          ? response.data.domisili_santri[
              response.data.domisili_santri.length - 1
            ].wilayah
          : null;
        user.alias_wilayah = response.data.domisili_santri
          ? response.data.domisili_santri[
              response.data.domisili_santri.length - 1
            ].wilayah
              .toLowerCase()
              .replace(/ /g, "-")
          : null;
        user.blok = response.data.domisili_santri
          ? response.data.domisili_santri[
              response.data.domisili_santri.length - 1
            ].blok
          : null;
        user.id_blok = response.data.domisili_santri
          ? response.data.domisili_santri[
              response.data.domisili_santri.length - 1
            ].id_blok
          : null;
      } else {
        user.wilayah = null;
        user.alias_wilayah = null;
        user.blok = null;
        user.id_blok = null;
      }

      await data.update(user);

      return res.status(200).json({
        status: 200,
        message: "OK",
        result: data,
      });
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
  updatePassword: async (req, res) => {
    try {
      const data = await User.findOne({
        where: {
          uuid: req.params.uuid,
        },
      });
      if (!data) {
        return res.status(404).json({
          status: 404,
          message: "NOT FOUND",
          error: "user tidak di temukan",
        });
      }
      const { error, value } = userSchema.updatePassword.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: error.message,
        });
      }
      if (value.password != value.passwordConfirmation) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: "konfirmasi password tidak sesuai",
        });
      }
      value.password = await bcrypt.hashSync(value.password, 12);
      const user = {
        password: value.password,
      };

      await data.update(user);

      return res.status(200).json({
        status: 200,
        message: "OK",
        result: data,
      });
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
  //   remove data
  remove: async (req, res) => {
    try {
      // get data from database
      const data = await User.findOne({
        where: {
          uuid: req.params.uuid,
        },
      });
      if (!data) {
        return res.status(404).json({
          status: 404,
          message: "NOT FOUND",
          error: `user tidak ditemukan`,
        });
      }

      await data.destroy();

      return res.status(204).json();
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
};
