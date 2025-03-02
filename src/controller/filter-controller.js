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
};
