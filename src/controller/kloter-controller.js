const { Op } = require("sequelize");
const { Area, Dropspot, Armada } = require("../../models");
const kloterSchema = require("../validation/kloter-schema");

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
      const data = await Armada.findAndCountAll({
        where: {
          [Op.or]: {
            namaKloter: {
              [Op.like]: `%${search}%`,
            },
            namaArmada: {
              [Op.like]: `%${search}%`,
            },
          },
          isKloter: "Y",
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
  //   get data by id
  getById: async (req, res) => {
    try {
      // get data from database
      const data = await Armada.findOne({
        where: {
          id: req.params.id,
        },
        include: {
          model: Dropspot,
          as: "dropspot",
          include: {
            model: Area,
            as: "area",
          },
        },
        isKloter: "Y",
      });
      if (!data) {
        return res.status(404).json({
          status: 404,
          message: "NOT FOUND",
          error: `kloter tidak ditemukan`,
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
  //   create data
  create: async (req, res) => {
    try {
      var { error, value } = kloterSchema.AddUp.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: error.message,
        });
      }
      const result = await Armada.create({
        ...value,
        isKloter: "Y",
      });

      res.status(201).json({
        status: 201,
        message: "CREATED",
        data: result,
      });
    } catch (err) {
      res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
  //   update data
  update: async (req, res) => {
    try {
      // get data from database
      const data = await Armada.findOne({
        where: {
          id: req.params.id,
          isKloter: "Y",
        },
      });
      if (!data) {
        return res.status(404).json({
          status: 404,
          message: "NOT FOUND",
          error: `kloter tidak ditemukan`,
        });
      }
      const { error, value } = kloterSchema.AddUp.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: error.message,
        });
      }
      const result = await data.update(value);

      return res.status(200).json({
        status: 200,
        message: "OK",
        data: result,
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
      const data = await Armada.findOne({
        where: {
          id: req.params.id,
          isKloter: "Y",
        },
      });
      if (!data) {
        return res.status(404).json({
          status: 404,
          message: "NOT FOUND",
          error: `kloter tidak ditemukan`,
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
