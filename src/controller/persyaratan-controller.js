const { Op } = require("sequelize");
const {
  Santri,
  Penumpang,
  Ketuntasan,
  SantriPersyaratan,
  sequelize,
} = require("../../models");
const axios = require("axios");
const persyaratanSchema = require("../validation/persyaratan-schema");
const ExcelJS = require("exceljs");

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
        attributes: {
          exclude: ["raw"],
        },
        where: {
          [Op.or]: {
            nama_lengkap: {
              [Op.like]: `%${search}%`,
            },
            niup: {
              [Op.like]: `%${search}%`,
            },
          },
          ...(req.user.role === "daerah" && { id_blok: req.user.id_blok }),
          ...(req.user.role === "wilayah" && {
            alias_wilayah: req.user.alias_wilayah,
          }),
          ...(req.query.jenis_kelamin && {
            jenis_kelamin: req.query.jenis_kelamin,
          }),
          ...(req.query.wilayah && { alias_wilayah: req.query.wilayah }),
          ...(req.query.blok && { id_blok: req.query.blok }),
          ...(req.query.negara && { negara: req.query.negara }),
          ...(req.query.provinsi && { provinsi: req.query.provinsi }),
          ...(req.query.kabupaten && { kabupaten: req.query.kabupaten }),
          ...(req.query.kecamatan && { kecamatan: req.query.kecamatan }),
        },
        include: [
          {
            model: Penumpang,
            required: true,
            as: "penumpang",
            attributes: ["id", "statusKepulangan"],
            where: {
              statusKepulangan: "Y",
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
          {
            model: SantriPersyaratan,
            as: "kamtib",
            where: {
              ketuntasanId: 1,
              ...(req.query.kamtib && { status: req.query.kamtib }),
            },
            required: true,
          },
          {
            model: SantriPersyaratan,
            as: "fa",
            where: {
              ketuntasanId: 2,
              ...(req.query.fa && { status: req.query.fa }),
            },
            required: true,
          },
          {
            model: SantriPersyaratan,
            as: "bps",
            where: {
              ketuntasanId: 3,
              ...(req.query.bps && { status: req.query.bps }),
            },
            required: true,
          },
          {
            model: SantriPersyaratan,
            as: "kosmara",
            where: {
              ketuntasanId: 4,
              ...(req.query.kosmara && { status: req.query.kosmara }),
            },
            required: true,
          },
        ],
        limit,
        offset,
        order: [
          [
            sequelize.literal(
              `CASE WHEN niup = '11420204139' THEN 0 ELSE 1 END`
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
  tuntas: async (req, res) => {
    try {
      const { error, value } = persyaratanSchema.tuntas.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: error.message,
        });
      }
      const promises = value.data.map(async (item) => {
        await SantriPersyaratan.update(
          { status: item.status },
          {
            where: {
              santriUuid: req.params.uuid,
              ketuntasanId: item.ketuntasanId,
            },
          }
        );
      });

      await Promise.all(promises);

      return res.status(200).json({
        status: 200,
        message: "OK",
      });
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
  tuntas: async (req, res) => {
    try {
      const { error, value } = persyaratanSchema.tuntas.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: error.message,
        });
      }
      const promises = value.data.map(async (item) => {
        await SantriPersyaratan.update(
          { status: item.status },
          {
            where: {
              santriUuid: req.params.uuid,
              ketuntasanId: item.ketuntasanId,
            },
          }
        );
      });

      await Promise.all(promises);

      return res.status(200).json({
        status: 200,
        message: "OK",
      });
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
  tuntasMobile: async (req, res) => {
    try {
      console.log(req.user);

      const santri = await Santri.findOne({
        where: {
          uuid: req.params.uuid,
        },
        attributes: ["uuid", "alias_wilayah", "id_blok"],
      });
      if (
        req.user.role == "wilayah" &&
        req.user.alias_wilayah != santri.alias_wilayah
      ) {
        return res.status(403).json({
          status: 403,
          message: "UNAUTHORIZED",
          error: "Anda tidak memiliki akses",
        });
      }
      if (req.user.role == "daerah" && req.user.id_blok != santri.id_blok) {
        return res.status(403).json({
          status: 403,
          message: "UNAUTHORIZED",
          error: "Anda tidak memiliki akses",
        });
      }
      const { error, value } = persyaratanSchema.tuntasMobile.validate(
        req.body
      );
      if (error) {
        return res.status(400).json({
          status: 400,
          message: "BAD REQUEST",
          error: error.message,
        });
      }

      if (
        req.user.role != "wilayah" &&
        value.type == "KAMTIB" &&
        req.user.jenis_kelamin != "L"
      ) {
        return res.status(403).json({
          status: 403,
          message: "UNAUTHORIZED",
          error: "Anda tidak memiliki akses",
        });
      }

      var kId;
      if (value.type == "KAMTIB") {
        kId = 1;
      } else if (value.type == "FA") {
        kId = 2;
      }
      await SantriPersyaratan.update(
        { status: value.status },
        {
          where: {
            santriUuid: req.params.uuid,
            ketuntasanId: kId,
          },
        }
      );

      return res.status(200).json({
        status: 200,
        message: "OK",
      });
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
  download: async (req, res) => {
    try {
      const data = await SantriPersyaratan.findAll({
        include: [
          {
            model: Santri,
            as: "santri",
            attributes: { exclude: ["raw"] },
            where: {
              ...(req.query.jenis_kelamin && {
                jenis_kelamin: req.query.jenis_kelamin,
              }),
            },
          },
          {
            model: Ketuntasan,
            as: "ketuntasan",
            where: {
              alias: req.params.alias,
            },
          },
        ],
      });
      // Membuat workbook dan worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(req.params.alias);

      // Mengatur header sederhana
      worksheet.getCell("A1").value = "No";
      worksheet.getCell("B1").value = "NIUP";
      worksheet.getCell("C1").value = "Nama";
      worksheet.getCell("D1").value = "Jenis Kelamin";
      worksheet.getCell("E1").value = "Status";

      // Menambahkan data mulai dari baris kedua
      data.forEach((p, i) => {
        worksheet.addRow([
          i + 1, // No
          p.santri.niup, // NIUP
          p.santri.nama_lengkap, // Nama
          p.santri.jenis_kelamin, // Jenis Kelamin
          p.status ? "Y" : "T",
        ]);
      });

      // Menyiapkan response sebagai file Excel untuk di-download
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + Date.now() + "-persyaratan.xlsx"
      );

      // Menyimpan workbook ke stream dan mengirimkannya sebagai response
      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
  upload: async (req, res) => {
    const excelBuffer = req.file.buffer;

    const workbook = new ExcelJS.Workbook();
    workbook.xlsx
      .load(excelBuffer)
      .then(() => {
        const worksheet = workbook.worksheets[0]; // Pastikan sesuai dengan nama worksheet yang Anda gunakan
        const data = [];

        // Loop melalui baris 6 ke atas dan ambil kolom B dan D
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          if (rowNumber >= 2) {
            const B = row.getCell("B").value;
            const E = row.getCell("E").value;
            data.push({
              niup: B,
              status: E == "Y" ? true : false,
            });
          }
        });
        const promises = data.map(async (d) => {
          try {
            const persyaratan = await SantriPersyaratan.findOne({
              include: [
                {
                  model: Santri,
                  as: "santri",
                  attributes: { exclude: ["raw"] },
                  where: {
                    niup: d.niup,
                  },
                },
                {
                  model: Ketuntasan,
                  as: "ketuntasan",
                  where: {
                    alias: req.params.alias,
                  },
                },
              ],
            });

            if (persyaratan) {
              // Lakukan update pada data yang diperoleh dari Excel
              persyaratan.status = d.status;
              await persyaratan.save();
            } else {
              return `Data dengan niup ${d.niup} tidak ditemukan.`;
            }
          } catch (error) {
            return `Terjadi kesalahan: ${error.message}`;
          }
        });

        Promise.all(promises)
          .then((results) => {
            results.forEach((result) => {
              //
            });
          })
          .catch((error) => {
            //
          });

        res.status(200).json({
          status: 200,
          message: "OK",
        });
      })
      .catch((err) => {
        return res.status(500).json({
          status: 500,
          message: "INTERNAL SERVER ERROR",
          error: err.message,
        });
      });
  },
};
