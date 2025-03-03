const { Op } = require("sequelize");
const {
  Area,
  Dropspot,
  Armada,
  Penumpang,
  Santri,
  User,
} = require("../../models");
const armadaSchema = require("../validation/armada-schema");

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
          namaArmada: {
            [Op.like]: `%${search}%`,
          },
          ...(req.query.type && { type: req.query.type }),
          ...(req.query.jenis && { jenis: req.query.jenis }),
        },
        attributes: { exclude: ["UserUuid"] },
        include: [
          {
            model: Dropspot,
            as: "dropspot",
            attributes: ["id", "areaId", "namaDropspot"],
            where: {
              ...(req.query.area && { areaId: req.query.area }),
              ...(req.query.dropspot && { id: req.query.dropspot }),
            },
          },
          {
            model: Penumpang,
            as: "penumpang",
            attributes: ["id", "armadaId"],
          },
          {
            model: User,
            as: "user",
            attributes: { exclude: ["password"] },
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
  // // list all data
  // filter: async (req, res) => {
  //   try {
  //     // get data from database
  //     const area = await Area.findAll({
  //       attributes: ["id", "namaArea"],
  //       where: {
  //         // ...(req.query.area && { areaId: req.query.area }),
  //       },
  //     });
  //     return res.status(200).json({
  //       status: 200,
  //       message: "OK",
  //       data: { area },
  //     });
  //   } catch (err) {
  //     return res.status(500).json({
  //       status: 500,
  //       message: "INTERNAL SERVER ERROR",
  //       error: err.message,
  //     });
  //   }
  // },
  //   get data by id
  getById: async (req, res) => {
    try {
      // get data from database
      const data = await Armada.findOne({
        where: {
          id: req.params.id,
        },
        include: [
          {
            model: Dropspot,
            as: "dropspot",
            include: {
              model: Area,
              as: "area",
            },
          },
          {
            model: Penumpang,
            as: "penumpang",
            include: [
              {
                model: Santri,
                as: "santri",
                attributes: { exclude: ["raw"] },
              },
              {
                model: Dropspot,
                as: "dropspot",
                include: {
                  model: Area,
                  as: "area",
                },
              },
            ],
          },
          {
            model: User,
            as: "user",
            attributes: { exclude: ["password"] },
          },
        ],
      });
      if (!data) {
        return res.status(404).json({
          status: 404,
          message: "NOT FOUND",
          error: `armada tidak ditemukan`,
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
      var { error, value } = armadaSchema.add.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: error.message,
        });
      }
      const drop = await Dropspot.findOne({
        where: {
          id: value.dropspotId,
        },
      });
      if (!drop) {
        return res.status(404).json({
          status: 404,
          message: "NOT FOUND",
          error: "dropspot tidak ditemukan",
        });
      }
      const armd = await Armada.findAndCountAll({
        where: {
          dropspotId: value.dropspotId,
          jenis: value.jenis,
        },
      });
      const result = await Armada.create({
        namaArmada: `${value.type.toUpperCase()} ${
          armd.count + 1
        } (${value.jenis.toUpperCase()}) - ${drop.namaDropspot}`,
        type: value.type,
        jenis: value.jenis,
        hargaSewa: value.hargaSewa,
        dropspotId: value.dropspotId,
        jadwalKeberangkatan: value.jadwalKeberangkatan,
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
        },
      });
      if (!data) {
        return res.status(404).json({
          status: 404,
          message: "NOT FOUND",
          error: `armada tidak ditemukan`,
        });
      }
      const { error, value } = armadaSchema.up.validate(req.body);
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
        },
      });
      if (!data) {
        return res.status(404).json({
          status: 404,
          message: "NOT FOUND",
          error: `armada tidak ditemukan`,
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
