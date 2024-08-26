const { Op, Sequelize } = require("sequelize");
const {
  Penumpang,
  Santri,
  // Tujuan,
  Dropspot,
  Area,
  // sequelize,
} = require("../../models");
// const penumpangSchema = require("../validation/penumpang-schema");

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
      const data = await Penumpang.findAndCountAll({
        attributes: {
          include: [
            [
              Sequelize.literal("`dropspot`.`harga` - `tagihan`"),
              "selisih_tagihan",
            ],
            [
              Sequelize.literal("`dropspot`.`harga` - `totalBayar`"),
              "selisih_tarif_terbayar",
            ],
            [
              Sequelize.literal("`tagihan` - `totalBayar`"),
              "selisih_tagihan_terbayar",
            ],
          ],
          exclude: ["statusKepulangan"],
        },
        where: {
          statusRombongan: "Y",
          dropspotId: { [Op.not]: null },
        },
        include: [
          {
            model: Santri,
            as: "santri",
            attributes: { exclude: ["raw"] },
            where: {
              nama_lengkap: {
                [Op.like]: `%${search}%`,
              },
            },
          },
          {
            model: Dropspot,
            as: "dropspot",
            attributes: {
              exclude: ["cakupan", "grup", "jadwalKeberangkatan"],
            },
            include: {
              model: Area,
              as: "area",
              attributes: {
                exclude: ["picInt", "hpPicInt", "picExt", "hpPicExt"],
              },
            },
          },
        ],
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
};
