const { Op, Sequelize } = require("sequelize");
const {
  Penumpang,
  Santri,
  // Tujuan,
  Dropspot,
  Area,
  // sequelize,
} = require("../../models");
// const penumpangSchema = require("../validation/penumpang-schema");
const ExcelJS = require("exceljs");
const { response } = require("express");

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
        attributes: {
          include: [
            [
              Sequelize.literal("`dropspot`.`harga` - `tagihan`"),
              "selisih_tagihan",
            ],
            [
              Sequelize.literal("`dropspot`.`harga` - `totalBayar`"),
              "selisih_tarif_terbayar",
            ],
            [
              Sequelize.literal("`tagihan` - `totalBayar`"),
              "selisih_tagihan_terbayar",
            ],
          ],
          exclude: ["statusKepulangan"],
        },
        where: {
          statusRombongan: "Y",
          dropspotId: { [Op.not]: null },
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
            },
          },
          {
            model: Dropspot,
            as: "dropspot",
            attributes: {
              exclude: ["cakupan", "grup", "jadwalKeberangkatan"],
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
};
