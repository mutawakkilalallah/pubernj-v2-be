const { Op } = require("sequelize");
const {
  Penumpang,
  Santri,
  Armada,
  Ticket,
  Transportasi,
  Rute,
} = require("../../models");
const ticketSchema = require("../validation/ticket-schema");

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
      const data = await Ticket.findAndCountAll({
        // where: {
        //   namaArea: {
        //     [Op.like]: `%${search}%`,
        //   },
        // },
        include: [
          {
            model: Penumpang,
            as: "penumpang",
            include: {
              model: Santri,
              as: "santri",
              attributes: { exclude: ["raw"] },
            },
          },
          {
            model: Armada,
            as: "kloter",
          },
          {
            model: Transportasi,
            as: "transportasi",
          },
          {
            model: Rute,
            as: "ruteAwal",
          },
          {
            model: Rute,
            as: "ruteAkhir",
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
  //   get data by id
  getById: async (req, res) => {
    try {
      // get data from database
      const data = await Ticket.findOne({
        where: {
          id: req.params.id,
        },
        include: [
          {
            model: Penumpang,
            as: "penumpang",
            include: {
              model: Santri,
              as: "santri",
            },
          },
          {
            model: Armada,
            as: "kloter",
          },
          {
            model: Transportasi,
            as: "transportasi",
          },
          {
            model: Rute,
            as: "ruteAwal",
          },
          {
            model: Rute,
            as: "ruteAkhir",
          },
        ],
      });
      if (!data) {
        return res.status(404).json({
          status: 404,
          message: "NOT FOUND",
          error: `tiket tidak ditemukan`,
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
      var { error, value } = ticketSchema.addUp.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: error.message,
        });
      }
      const result = await Ticket.create(value);

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
      const data = await Ticket.findOne({
        where: {
          id: req.params.id,
        },
      });
      if (!data) {
        return res.status(404).json({
          status: 404,
          message: "NOT FOUND",
          error: `tiket tidak ditemukan`,
        });
      }
      const { error, value } = ticketSchema.addUp.validate(req.body);
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
      const data = await Ticket.findOne({
        where: {
          id: req.params.id,
        },
      });
      if (!data) {
        return res.status(404).json({
          status: 404,
          message: "NOT FOUND",
          error: `tiket tidak ditemukan`,
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
