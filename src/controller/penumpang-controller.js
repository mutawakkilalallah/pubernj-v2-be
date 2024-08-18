const { Op } = require("sequelize");
const { Penumpang, Santri, Tujuan, Dropspot, Area } = require("../../models");
const penumpangSchema = require("../validation/penumpang-schema");

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
            model: Tujuan,
            as: "tujuan",
            include: {
              model: Dropspot,
              as: "dropspot",
              include: {
                model: Area,
                as: "area",
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
  // //   get data by id
  // getById: async (req, res) => {
  //   try {
  //     // get data from database
  //     const data = await Area.findOne({
  //       where: {
  //         id: req.params.id,
  //       },
  //       include: {
  //         model: Dropspot,
  //         as: "dropspot",
  //       },
  //     });
  //     if (!data) {
  //       return res.status(404).json({
  //         status: 404,
  //         message: "NOT FOUND",
  //         error: `area tidak ditemukan`,
  //       });
  //     }
  //     return res.status(200).json({
  //       status: 200,
  //       message: "OK",
  //       data: data,
  //     });
  //   } catch (err) {
  //     return res.status(500).json({
  //       status: 500,
  //       message: "INTERNAL SERVER ERROR",
  //       error: err.message,
  //     });
  //   }
  // },
  //   update status kepulangan
  statusKepulangan: async (req, res) => {
    try {
      // get data from database
      const data = await Penumpang.findOne({
        where: {
          santriUuid: req.params.uuid,
        },
      });
      if (!data) {
        return res.status(404).json({
          status: 404,
          message: "NOT FOUND",
          error: `santri tidak ditemukan`,
        });
      }
      const { error, value } = penumpangSchema.statusKepulangan.validate(
        req.body
      );
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
  //   update status rombongan
  statusRombongan: async (req, res) => {
    try {
      // get data from database
      const data = await Penumpang.findOne({
        where: {
          santriUuid: req.params.uuid,
        },
      });
      if (!data) {
        return res.status(404).json({
          status: 404,
          message: "NOT FOUND",
          error: `santri tidak ditemukan`,
        });
      }
      const { error, value } = penumpangSchema.statusRombongan.validate(
        req.body
      );
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
  //   add dropspot
  addDropspot: async (req, res) => {
    try {
      // get data from database
      const data = await Penumpang.findOne({
        where: {
          santriUuid: req.params.uuid,
        },
      });
      if (!data) {
        return res.status(404).json({
          status: 404,
          message: "NOT FOUND",
          error: `penumpang tidak ditemukan`,
        });
      }
      const { error, value } = penumpangSchema.addDrop.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: error.message,
        });
      }
      const result = await Tujuan.create({
        penumpangId: data.id,
        dropspotId: value.dropspotId,
      });

      return res.status(201).json({
        status: 201,
        message: "CREATED",
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
  // //   remove data
  // remove: async (req, res) => {
  //   try {
  //     // get data from database
  //     const data = await Area.findOne({
  //       where: {
  //         id: req.params.id,
  //       },
  //     });
  //     if (!data) {
  //       return res.status(404).json({
  //         status: 404,
  //         message: "NOT FOUND",
  //         error: `area tidak ditemukan`,
  //       });
  //     }

  //     await data.destroy();

  //     return res.status(204).json();
  //   } catch (err) {
  //     return res.status(500).json({
  //       status: 500,
  //       message: "INTERNAL SERVER ERROR",
  //       error: err.message,
  //     });
  //   }
  // },
};
