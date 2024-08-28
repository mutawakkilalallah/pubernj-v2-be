const { Op } = require("sequelize");
const {
  Santri,
  Penumpang,
  Ketuntasan,
  SantriPersyaratan,
  sequelize,
} = require("../../models");
const axios = require("axios");

async function processData(uuid, itm) {
  // const transaction = await sequelize.transaction();
  try {
    // Find existing records to avoid duplicates
    const existingRecords = await SantriPersyaratan.findAll({
      where: {
        santriUuid: uuid,
        ketuntasanId: itm,
      },
      attributes: ["ketuntasanId"],
    });

    // Extract existing ketuntasanIds
    const existingIds = existingRecords.map((record) => record.ketuntasanId);

    // Filter out the items that already exist
    const dataToInsert = itm
      .filter((ktsId) => !existingIds.includes(ktsId))
      .map((ktsId) => ({
        santriUuid: uuid,
        ketuntasanId: ktsId,
      }));

    // Only bulkCreate if there are new records to insert
    if (dataToInsert.length > 0) {
      await SantriPersyaratan.bulkCreate(dataToInsert);
    }

    // await transaction.commit();
    return true;
  } catch (err) {
    // await transaction.rollback();
    console.log(uuid + " : " + err.message);
    return false;
  }
}

module.exports = {
  generatePersyaratan: async (req, res) => {
    try {
      let totalBerhasil = 0;
      let totalGagal = 0;

      const syarat = await Ketuntasan.findAll({
        attributes: ["id"],
        where: { isAktif: "Y" },
      });
      const itm = syarat.map((item) => item.id);
      const data = await Santri.findAll({
        attributes: ["uuid"],
        // where: {
        // id_blok: 52,
        // },
        include: {
          model: Penumpang,
          as: "penumpang",
          attributes: ["statusKepulangan"],
          // where: {
          //   statusKepulangan: "Y",
          // },
        },
      });
      const results = await Promise.all(
        data.map((d) => processData(d.uuid, itm))
      );

      // aktifkan jika ingin mengahpus riwayat
      // if (req.query.hapusRiwayat == "Y") {
      //   const syaratNonAktif = await Ketuntasan.findAll({
      //     attributes: ["id"],
      //     where: { isAktif: "T" },
      //   });
      //   const itmNonAktif = syaratNonAktif.map((item) => item.id);
      //   await SantriPersyaratan.destroy({
      //     where: {
      //       ketuntasanId: itmNonAktif,
      //     },
      //   });
      // }

      const berhasil = results.filter((result) => result).length;
      const gagal = results.filter((result) => !result).length;

      totalBerhasil += berhasil;
      totalGagal += gagal;

      console.log(
        `didapat : ${data.length} - diproses : ${results.length} | berhasil(${berhasil})/gagal(${gagal})`
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
        include: [
          {
            model: Penumpang,
            attributes: ["statusKepulangan"],
            as: "penumpang",
            where: {
              statusKepulangan: "Y",
            },
          },
          {
            model: SantriPersyaratan,
            as: "persyaratan",
            include: {
              model: Ketuntasan,
              as: "ketuntasan",
              where: {
                isAktif: "Y",
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
