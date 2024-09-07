const { sequelize } = require("../../models");

module.exports = {
  // list all data
  byDropspotPaPi: async (req, res) => {
    try {
      res.status(200).json([]);
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
};
