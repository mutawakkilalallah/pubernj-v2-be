const { Op, where } = require("sequelize");
const {
  Penumpang,
  Santri,
  Tujuan,
  Dropspot,
  Area,
  sequelize,
} = require("../../models");
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
        attributes: { exclude: ["statusKepulangan", "tagihan", "totalBayar"] },
        where: {
          statusRombongan: "Y",
          dropspotId: { [Op.not]: null },
          ...(req.query.pembayaran && {
            statusPembayaran: req.query.pembayaran,
          }),
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
              ...(req.query.jenis_kelamin && {
                jenis_kelamin: req.query.jenis_kelamin,
              }),
              ...(req.user.role === "daerah" && { id_blok: req.user.id_blok }),
              ...(req.user.role === "wilayah" && {
                alias_wilayah: req.user.alias_wilayah,
              }),
            },
          },
          {
            model: Dropspot,
            as: "dropspot",
            attributes: {
              exclude: ["cakupan", "grup", "harga", "jadwalKeberangkatan"],
            },
            where: {
              ...(req.query.dropspot && { id: req.query.dropspot }),
              ...(req.query.area && { areaId: req.query.area }),
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
        order: [
          [
            sequelize.literal(
              `CASE WHEN santri.niup = '11420204139' THEN 0 ELSE 1 END`
            ),
            "ASC",
          ],
          ["updatedAt", "DESC"],
        ],
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
      if (data.statusRombongan == "Y") {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: "santri masih berstatus rombongan",
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
      if (data.dropspotId) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: `santri masih memiliki dropspot aktif`,
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
      if (data.statusKepulangan != "Y") {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: "santri belum berstatus pulang",
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
    // const transaction = await sequelize.transaction();
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
      if (data.statusRombongan != "Y") {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: `santri belum berstatus rombongan`,
        });
      }
      if (data.dropspotId) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: `santri masih memiliki dropspot aktif`,
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
      const result = await Tujuan.create(
        {
          penumpangId: data.id,
          dropspotId: value.dropspotId,
        }
        // { transaction }
      );
      if (result) {
        await data.update(
          {
            dropspotId: value.dropspotId,
          }
          // { transaction }
        );
      }

      // await transaction.commit();
      return res.status(201).json({
        status: 201,
        message: "CREATED",
        data: result,
      });
    } catch (err) {
      // await transaction.rollback();
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
  //   daftar penumpang
  daftarPenumpang: async (req, res) => {
    const transaction = await sequelize.transaction();
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
      if (data.dropspotId) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: "santri sudah memiliki dropspot",
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
      await data.update(
        {
          statusKepulangan: "Y",
          statusRombongan: "Y",
          dropspotId: value.dropspotId,
        },
        { transaction }
      );
      const result = await Tujuan.create(
        {
          penumpangId: data.id,
          dropspotId: value.dropspotId,
        },
        { transaction }
      );
      await transaction.commit();
      return res.status(201).json({
        status: 201,
        message: "CREATED",
        data: result,
      });
    } catch (err) {
      await transaction.rollback();
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
  nonaktifDropspot: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      // get data from database
      const data = await Tujuan.findOne({
        where: {
          id: req.params.id,
        },
      });
      if (!data) {
        return res.status(404).json({
          status: 404,
          message: "NOT FOUND",
          error: `tujuan tidak ditemukan`,
        });
      }
      if (data.isAktif == "T") {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: "tujuan sudah nonaktif",
        });
      }
      const penumpang = await Penumpang.findOne({
        where: {
          id: data.penumpangId,
        },
      });
      if (!penumpang) {
        return res.status(404).json({
          status: 404,
          message: "NOT FOUND",
          error: `penumpang tidak ditemukan`,
        });
      }
      await penumpang.update(
        {
          dropspotId: null,
        },
        { transaction }
      );
      const result = await data.update(
        {
          isAktif: "T",
        },
        { transaction }
      );
      await transaction.commit();
      return res.status(200).json({
        status: 200,
        message: "OK",
        data: result,
      });
    } catch (err) {
      await transaction.rollback();
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
  aktifDropspot: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      // get data from database
      const data = await Tujuan.findOne({
        where: {
          id: req.params.id,
        },
      });
      if (!data) {
        return res.status(404).json({
          status: 404,
          message: "NOT FOUND",
          error: `tujuan tidak ditemukan`,
        });
      }
      if (data.isAktif == "Y") {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: "tujuan sudah aktif",
        });
      }
      const penumpang = await Penumpang.findOne({
        where: {
          id: data.penumpangId,
        },
      });
      if (!penumpang) {
        return res.status(404).json({
          status: 404,
          message: "NOT FOUND",
          error: `penumpang tidak ditemukan`,
        });
      }
      if (penumpang.statusRombongan != "Y") {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: `santri belum berstatus rombongan`,
        });
      }
      if (penumpang.dropspotId) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: "santri sudah memiliki dropspot",
        });
      }
      await penumpang.update(
        {
          dropspotId: data.dropspotId,
        },
        { transaction }
      );
      const result = await data.update(
        {
          isAktif: "Y",
        },
        { transaction }
      );
      await transaction.commit();
      return res.status(200).json({
        status: 200,
        message: "OK",
        data: result,
      });
    } catch (err) {
      await transaction.rollback();
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
  addArmada: async (req, res) => {
    try {
      const { error, value } = penumpangSchema.addArmada.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: error.message,
        });
      }
      const result = await Penumpang.update(
        {
          armadaId: req.params.armadaId,
        },
        {
          where: {
            id: value.penumpang,
          },
        }
      );
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
};
