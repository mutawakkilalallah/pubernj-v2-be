const { Op } = require("sequelize");
const { User } = require("../../models");
const axios = require("axios");
const pendampingSchema = require("../validation/pendamping-schema");
const bcrypt = require("bcrypt");

async function processDataSantri(niup) {
  try {
    if (niup.toString().length != 11) {
      console.log(niup + " : " + "format niup tidak sesuai");
      return false;
    }

    const response = await axios.get(
      `${process.env.PEDATREN_URL}/person/niup/${niup}`,
      {
        headers: {
          "x-api-key": process.env.PEDATREN_TOKEN,
        },
      }
    );
    const pwd = await bcrypt.hashSync(
      response.data.tanggal_lahir.split("-").join(""),
      12
    );
    await User.create({
      uuid: response.data.uuid,
      nama_lengkap: response.data.nama_lengkap,
      niup: niup,
      jenis_kelamin: response.data.jenis_kelamin,
      username: niup,
      password: pwd,
      role: "pendamping",
    });

    return true;
  } catch (err) {
    console.log(niup + " : " + err.message);
    return false;
  }
}

module.exports = {
  generatePendamping: async (req, res) => {
    try {
      let totalBerhasil = 0;
      let totalGagal = 0;

      const { error, value } = pendampingSchema.create.validate(req.body);

      if (error) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: error.message,
        });
      }

      const results = await Promise.all(
        value.niup.map((d) => processDataSantri(d))
      );

      const berhasil = results.filter((result) => result).length;
      const gagal = results.filter((result) => !result).length;

      totalBerhasil += berhasil;
      totalGagal += gagal;

      console.log(
        `didapat : ${value.niup.length} - diproses : ${results.length} | berhasil(${berhasil})/gagal(${gagal})`
      );

      console.log(
        `Total berhasil: ${totalBerhasil}, Total gagal: ${totalGagal}`
      );

      return res.status(200).json({
        status: 200,
        message: "OK",
        data: "Berhasil memproses data pendamping",
      });
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
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
        attributes: ["uuid", "nama_lengkap", "niup", "createdAt", "updatedAt"],
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
            role: "pendamping",
          },
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
  //   get data by uuid
  getByUuid: async (req, res) => {
    try {
      // get data from database
      const data = await User.findOne({
        attributes: ["uuid", "nama_lengkap", "niup", "createdAt", "updatedAt"],
        where: {
          [Op.and]: {
            uuid: req.params.uuid,
            role: "pendamping",
          },
        },
        // include: {
        //   model: Dropspot,
        //   as: "dropspot",
        // },
      });
      if (!data) {
        return res.status(404).json({
          status: 404,
          message: "NOT FOUND",
          error: `pendamping tidak ditemukan`,
        });
      }
      return res.status(200).json({
        status: 200,
        message: "OK",
        data: data,
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
          error: `pendamping tidak ditemukan`,
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
