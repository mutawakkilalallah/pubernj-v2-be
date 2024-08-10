const { Op } = require("sequelize");
const { Santri } = require("../../models");
const axios = require("axios");

async function processDataSantri(uuid) {
  try {
    const response = await axios.get(
      `${process.env.PEDATREN_URL}/person/${uuid}`,
      {
        headers: {
          "x-api-key": process.env.PEDATREN_TOKEN,
        },
      }
    );
    console.log(response.data.nama_lengkap);

    await Santri.create({
      uuid: response.data.uuid,
      niup: response.data.warga_pesantren.niup
        ? response.data.warga_pesantren.niup
        : null,
      nama_lengkap: response.data.nama_lengkap,
      jenis_kelamin: response.data.jenis_kelamin,
      negara: response.data.negara ? response.data.negara : null,
      provinsi: response.data.provinsi ? response.data.provinsi : null,
      kabupaten: response.data.kabupaten ? response.data.kabupaten : null,
      kecamatan: response.data.kecamatan ? response.data.kecamatan : null,
      wilayah: response.data.domisili_santri
        ? response.data.domisili_santri[
            response.data.domisili_santri.length - 1
          ].wilayah
        : null,
      alias_wilayah: response.data.domisili_santri
        ? response.data.domisili_santri[
            response.data.domisili_santri.length - 1
          ].wilayah
            .toLowerCase()
            .replace(/ /g, "-")
        : null,
      blok: response.data.domisili_santri
        ? response.data.domisili_santri[
            response.data.domisili_santri.length - 1
          ].blok
        : null,
      id_blok: response.data.domisili_santri
        ? response.data.domisili_santri[
            response.data.domisili_santri.length - 1
          ].id_blok
        : null,
      raw: JSON.stringify(response.data),
    });
    return true;
  } catch (err) {
    console.log(uuid + " : " + err.message);
    return false;
  }
}

module.exports = {
  generateSantri: async (req, res) => {
    try {
      let totalBerhasil = 0;
      let totalGagal = 0;

      const data = await axios.get(`${process.env.PEDATREN_URL}/santri`, {
        headers: {
          "x-api-key": process.env.PEDATREN_TOKEN,
        },
        params: {
          wilayah: "dalbar",
          blok: 52,
          disable_pagination: true,
        },
      });

      const results = await Promise.all(
        data.data.map((d) => processDataSantri(d.uuid))
      );

      const berhasil = results.filter((result) => result).length;
      const gagal = results.filter((result) => !result).length;

      totalBerhasil += berhasil;
      totalGagal += gagal;

      console.log(
        `didapat : ${data.data.length} - diproses : ${results.length} | berhasil(${berhasil})/gagal(${gagal})`
      );

      console.log(
        `Total berhasil: ${totalBerhasil}, Total gagal: ${totalGagal}`
      );

      return res.status(200).json({
        status: 20,
        message: "OK",
        // data: "Berhasil memproses data santri",
      });
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
  list: async (req, res) => {
    try {
      // define params for filter and pagination
      const search = req.query.cari || "";
      const page = req.query.page || 1;
      const limit = parseInt(req.query.limit) || 25;
      const offset = 0 + (page - 1) * limit;
      // get data from database
      const data = await Santri.findAndCountAll({
        attributes: { exclude: ["raw"] },
        where: {
          nama_lengkap: {
            [Op.like]: `%${search}%`,
          },
          // ...(req.query.area && { areaId: req.query.area }),
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
  getByUuid: async (req, res) => {
    try {
      // get data from database
      const data = await Santri.findOne({
        where: {
          uuid: req.params.uuid,
        },
      });
      if (!data) {
        return res.status(404).json({
          status: 404,
          message: "NOT FOUND",
          error: `santri tidak ditemukan`,
        });
      }
      data.raw = JSON.parse(data.raw);
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
};
