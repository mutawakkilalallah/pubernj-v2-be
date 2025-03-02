const { Op } = require("sequelize");
const { Santri, sequelize } = require("../../models");

module.exports = {
  negara: async (req, res) => {
    try {
      const data = await Santri.findAll({
        attributes: [
          [sequelize.fn("DISTINCT", sequelize.col("negara")), "negara"],
        ],
      });
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
  provinsi: async (req, res) => {
    try {
      const data = await Santri.findAll({
        attributes: [
          [sequelize.fn("DISTINCT", sequelize.col("provinsi")), "provinsi"],
        ],
        where: { negara: req.query.negara },
      });
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
  kabupaten: async (req, res) => {
    try {
      const data = await Santri.findAll({
        attributes: [
          [sequelize.fn("DISTINCT", sequelize.col("kabupaten")), "kabupaten"],
        ],
        where: { provinsi: req.query.provinsi },
      });
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
  kecamatan: async (req, res) => {
    try {
      const data = await Santri.findAll({
        attributes: [
          [sequelize.fn("DISTINCT", sequelize.col("kecamatan")), "kecamatan"],
        ],
        where: { kabupaten: req.query.kabupaten },
      });
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
  wilayah: async (req, res) => {
    try {
      const data = await Santri.findAll({
        attributes: [
          [
            sequelize.fn("DISTINCT", sequelize.col("alias_wilayah")),
            "alias_wilayah",
          ],
          "wilayah",
        ],
        where: {
          alias_wilayah: {
            [Op.ne]: null,
          },
          ...(req.user.role === "wilayah" && {
            alias_wilayah: req.user.alias_wilayah,
          }),
        },
        group: ["alias_wilayah", "wilayah"],
        order: [
          [
            sequelize.literal(
              'CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(alias_wilayah, "(", -1), ")", 1) AS UNSIGNED)'
            ),
            "ASC",
          ],
        ],
      });
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
  blok: async (req, res) => {
    try {
      const data = await Santri.findAll({
        attributes: [
          [sequelize.fn("DISTINCT", sequelize.col("id_blok")), "id_blok"],
          "blok",
        ],
        where: {
          id_blok: {
            [Op.ne]: null,
          },
          alias_wilayah: req.query.wilayah,
          ...(req.user.role === "daerah" && { id_blok: req.user.id_blok }),
        },
        group: ["id_blok", "blok"],
        order: [
          [
            sequelize.literal(
              'SUBSTRING_INDEX(SUBSTRING_INDEX(blok, "(", -1), ")", 1)'
            ),
            "ASC",
          ],
        ],
      });
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
};
