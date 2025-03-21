const { Op, Sequelize } = require("sequelize");
const {
  Penumpang,
  Santri,
  // Tujuan,
  Dropspot,
  Area,
  sequelize,
} = require("../../models");
// const penumpangSchema = require("../validation/penumpang-schema");
const ExcelJS = require("exceljs");
const { response } = require("express");

module.exports = {
  // list all data
  rekap: async (req, res) => {
    try {
      const result = await sequelize.query(`WITH harga_penumpang AS (
    SELECT 
        COALESCE(SUM(d.harga), 0) AS total_harga_penumpang,
        COALESCE(ROUND(SUM(CASE WHEN d.areaId IN (6, 11, 12, 17, 18, 35) THEN d.harga ELSE 0 END) / 2), 0) AS estimasi_milik_p4nj,
        COALESCE(ROUND(SUM(CASE WHEN d.areaId IN (6, 11, 12, 17, 18, 35) THEN p.totalBayar ELSE 0 END) / 2), 0) AS milik_p4nj
    FROM penumpangs p
    JOIN dropspots d ON p.dropspotId = d.id
), 
total_sewa AS (
    SELECT 
        COALESCE(SUM(a.hargaSewa), 0) AS total_sewa_armada
    FROM armadas a
), 
total_bayar AS (
    SELECT 
        COALESCE(SUM(p.totalBayar), 0) AS total_bayar_penumpang
    FROM penumpangs p
)

SELECT 
    hp.total_harga_penumpang,
    tb.total_bayar_penumpang,
    ts.total_sewa_armada,
    (hp.total_harga_penumpang - ts.total_sewa_armada - hp.estimasi_milik_p4nj) AS estimasi_laba,
    (tb.total_bayar_penumpang - ts.total_sewa_armada - hp.milik_p4nj) AS laba_sementara,
    hp.estimasi_milik_p4nj,
    hp.milik_p4nj
FROM harga_penumpang hp
JOIN total_sewa ts ON 1=1
JOIN total_bayar tb ON 1=1;
`);
      return res.status(200).json({
        status: 200,
        message: "OK",
        data: result[0],
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
      const data = await Penumpang.findAndCountAll({
        attributes: {
          include: [
            [
              Sequelize.literal("`tagihan` - `dropspot`.`harga`"),
              "selisih_tagihan",
            ],
            [
              Sequelize.literal("`totalBayar` - `dropspot`.`harga`"),
              "selisih_tarif_terbayar",
            ],
            [
              Sequelize.literal("`totalBayar` - `tagihan`"),
              "selisih_tagihan_terbayar",
            ],
          ],
          exclude: ["statusKepulangan"],
        },
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
              exclude: ["cakupan", "grup", "jadwalKeberangkatan"],
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
        order: [["updatedAt", "DESC"]],
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
  tagihan: async (req, res) => {
    try {
      const penumpang = await Penumpang.findAll({
        attributes: ["id", "santriUuid", "statusRombongan", "dropspotId"],
        where: {
          statusRombongan: "Y",
          dropspotId: { [Op.not]: null },
        },
        include: [
          {
            model: Santri,
            as: "santri",
            attributes: ["uuid", "niup", "nama_lengkap", "jenis_kelamin"],
          },
          {
            model: Dropspot,
            as: "dropspot",
            attributes: ["id", "harga"],
            where: {
              harga: { [Op.not]: 0 },
            },
          },
        ],
      });
      // Membuat workbook dan worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("tagihan");

      // Mengatur header sederhana
      worksheet.getCell("A1").value = "No";
      worksheet.getCell("B1").value = "NIUP";
      worksheet.getCell("C1").value = "Nama";
      worksheet.getCell("D1").value = "Jenis Kelamin";
      worksheet.getCell("E1").value = "Tarif";

      // Menambahkan data mulai dari baris kedua
      penumpang.forEach((p, i) => {
        worksheet.addRow([
          i + 1, // No
          p.santri.niup, // NIUP
          p.santri.nama_lengkap, // Nama
          p.santri.jenis_kelamin, // Jenis Kelamin
          p.dropspot.harga, // Tarif
        ]);
      });

      // // 1. Merge baris pertama dan isi data
      // worksheet.mergeCells("A1:B1");
      // worksheet.getCell("A1").value = "NAMA INSITUSI";
      // worksheet.getCell("C1").value =
      //   "NURUL JADID PAITON PROBOLINGGO, PONDOK PESANTREN";

      // // 2. Merge baris kedua dan isi data
      // worksheet.mergeCells("A2:B2");
      // worksheet.getCell("A2").value = "NAMA TAGIHAN";
      // worksheet.getCell("C2").value = "PUBER RAMADHAN 2024";

      // // 3. Kosongkan baris ketiga
      // worksheet.getRow(3).values = [];

      // // 4. Merge dan isi baris ke-4 dan ke-5 (header)
      // worksheet.mergeCells("A4:A5");
      // worksheet.mergeCells("B4:B5");
      // worksheet.mergeCells("C4:C5");
      // worksheet.mergeCells("D4:D5");
      // worksheet.mergeCells("E4:G4");
      // worksheet.mergeCells("H4:J4");

      // worksheet.getCell("A4").value = "NO";
      // worksheet.getCell("B4").value = "NIUP";
      // worksheet.getCell("C4").value = "NAMA";
      // worksheet.getCell("D4").value = "GRAND TOTAL";
      // worksheet.getCell("E4").value = "PUBER RAMADHAN 2024";
      // worksheet.getCell("H4").value = "ADMIN PUBER RAMADHAN 2024";

      // worksheet.getCell("E5").value = "NOMINAL";
      // worksheet.getCell("F5").value = "DISKON";
      // worksheet.getCell("G5").value = "TOTAL";
      // worksheet.getCell("H5").value = "NOMINAL";
      // worksheet.getCell("I5").value = "DISKON";
      // worksheet.getCell("J5").value = "TOTAL";

      // // 5. Mulai menambahkan data dari baris ke-6
      // penumpang.forEach((p, i) => {
      //   worksheet.addRow([
      //     i + 1, // NO
      //     p.santri.niup, // NIUP
      //     p.santri.nama_lengkap, // NAMA
      //     p.dropspot.harga + 1000, // GRAND TOTAL
      //     400000, // NOMINAL PUBER RAMADHAN 2024
      //     400000 - p.dropspot.harga, // DISKON PUBER RAMADHAN 2024
      //     p.dropspot.harga, // TOTAL PUBER RAMADHAN 2024
      //     1000, // NOMINAL ADMIN PUBER
      //     0, // DISKON ADMIN PUBER
      //     1000, // TOTAL ADMIN PUBER
      //   ]);
      // });

      // Menyiapkan response sebagai file Excel untuk di-download
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + Date.now() + "-penumpang.xlsx"
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
  uploadTagihan: async (req, res) => {
    const excelBuffer = req.file.buffer;

    const workbook = new ExcelJS.Workbook();
    workbook.xlsx
      .load(excelBuffer)
      .then(() => {
        const worksheet = workbook.getWorksheet("data_invoice"); // Pastikan sesuai dengan nama worksheet yang Anda gunakan
        const data = [];

        // Loop melalui baris 6 ke atas dan ambil kolom B dan D
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          if (rowNumber >= 2) {
            const B = row.getCell("B").value;
            const H = row.getCell("H").value;
            // const I = row.getCell("I").value;
            const K = row.getCell("K").value;
            // Pastikan nilai tidak kosong sebelum menambahkannya ke array
            // if (I === "Lunas") {
            data.push({
              niup: B,
              tagihan: H != 0 ? H - 1000 : 0,
              total_bayar: K != 0 ? K - 1000 : 0,
            });
            // }
          }
        });
        const promises = data.map(async (d) => {
          try {
            const penumpang = await Penumpang.findOne({
              attributes: [
                "id",
                "santriUuid",
                "tagihan",
                "totalBayar",
                "statusPembayaran",
                "dropspotId",
              ],
              include: [
                {
                  model: Santri,
                  as: "santri",
                  attributes: ["uuid", "niup"],
                  where: {
                    niup: d.niup,
                  },
                },
                {
                  model: Dropspot,
                  attributes: ["id", "harga"],
                  as: "dropspot",
                },
              ],
            });

            if (penumpang) {
              // Lakukan update pada data yang diperoleh dari Excel
              penumpang.totalBayar = d.total_bayar;
              penumpang.tagihan = d.tagihan;
              if (penumpang.dropspot.harga === d.total_bayar) {
                penumpang.statusPembayaran = "lunas";
              } else if (penumpang.dropspot.harga < d.total_bayar) {
                penumpang.statusPembayaran = "lebih";
              } else if (penumpang.dropspot.harga != 0 && d.total_bayar === 0) {
                penumpang.statusPembayaran = "belum-lunas";
              } else if (
                penumpang.dropspot.harga != 0 &&
                penumpang.dropspot.harga > d.total_bayar
              ) {
                penumpang.statusPembayaran = "kurang";
              }
              await penumpang.save();
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
