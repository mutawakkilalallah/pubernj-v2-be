const { Op } = require("sequelize");
const {
  Penumpang,
  Santri,
  Tujuan,
  Dropspot,
  Area,
  sequelize,
} = require("../../models");
const penumpangSchema = require("../validation/penumpang-schema");
const { jsPDF } = require("jspdf");
const fs = require("fs");
const path = require("path");

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
  deleteArmada: async (req, res) => {
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
          armadaId: null,
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
  cetakSurat: async (req, res) => {
    try {
      const data = await Santri.findAll({
        attributes: { exclude: ["raw"] },
        where: {
          // ...(req.user.role == "wilayah" && {
          //   alias_wilayah: req.user.alias_wilayah,
          // }),
          // ...(req.user.role == "daerah" && {
          //   id_blok: req.user.id_blok,
          // }),
          ...(req.query.wilayah && {
            alias_wilayah: req.query.wilayah,
          }),
          ...(req.query.blok && {
            id_blok: req.query.blok,
          }),
        },
        include: {
          model: Penumpang,
          as: "penumpang",
          where: {
            statusKepulangan: "Y",
          },
        },
        limit: 1,
      });

      const pageWidth = 16.5; // Lebar dalam cm
      const pageHeight = 21; // Tinggi dalam cm

      // Buat dokumen jsPDF
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "cm",
        format: [pageWidth, pageHeight],
      });

      const kopPath = path.join(__dirname, "../../assets", "kop.png");
      const kopBase64 = fs.readFileSync(kopPath, "base64");
      const qrPath = path.join(__dirname, "../../assets", "ttd-qr.png");
      const qrBase64 = fs.readFileSync(qrPath, "base64");

      data.forEach((item, index) => {
        if (index > 0) {
          doc.addPage();
        }

        doc.addImage(kopBase64, "PNG", 1, 0.5, 14.5, 3);

        doc.setFont("Helvetica");
        doc.setFontSize(8);
        doc.text("SURAT IZIN LIBUR MAULID 1446 H", 8.25, 3.8, {
          align: "center",
        });

        doc.text(`NOMOR : NJ-B/0457/A.IX/09.2024`, 8.25, 4.2, {
          align: "center",
        });

        doc.text(
          `Yang bertanda tangan dibawah ini, Kepala Pondok Pesantren Nurul Jadid Paiton Probolinggo Jawa Timur `,
          1,
          4.8
        );
        doc.text(`memberikan izin libur kepada :`, 1, 5.3);

        doc.text(`NIUP : ${item.niup}`, 1, 6);
        doc.text(`Nama : ${item.nama_lengkap}`, 1, 6.4);
        doc.text(`Wilayah : ${item.wilayah}`, 1, 6.8);
        doc.text(`Daerah : ${item.blok}`, 1, 7.2);
        doc.text(
          `Alamat : ${item.kecamatan}, ${item.provinsi}, ${item.negara}`,
          1,
          7.6
        );

        doc.text(
          `Santri putri tanggal 8 Rabiul Awal 1446 H/12 September 2024 M`,
          8.25,
          8.4,
          { align: "center" }
        );
        doc.text(`s.d 17 Rabiul Awal 1446 H/21 September 2024 M.`, 8.25, 8.8, {
          align: "center",
        });
        doc.text(
          `Santri putri tanggal 9 Rabiul Awal 1446 H/13 September 2024 M`,
          8.25,
          9.2,
          { align: "center" }
        );
        doc.text(`s.d 18 Rabiul Awal 1446 H/22 September 2024 M.`, 8.25, 9.6, {
          align: "center",
        });

        doc.text(
          `Demikian surat izin ini dibuat dengan sebenarnya dan untuk digunakan sebagaimana mestinya`,
          1,
          10.1
        );
        doc.text(`Paiton,`, 1, 10.7);
        doc.text(`06 Rabiul Awal 1446 H`, 2.3, 10.7);
        doc.text(`09 September 2024 M`, 2.3, 11.1);

        doc.addImage(qrBase64, "PNG", 1, 11.5, 2.5, 2.5);
        doc.text("KH. ABD. HAMID WAHID, M.Ag.", 1, 14.7);
        doc.text("NIUP : 31820500002", 1, 15.1);

        doc.setFontSize(6);
        doc.text(`Keterangan:`, 1, 16.7);
        doc.text(
          `1. Kedatangan Santri dan penyerahan surat izin libur ke KAMTIB Wilayah/Daerah selambat-lambatnya pukul 17.00 WIB (Ba’da Maghrib).`,
          1.2,
          17.1
        );
        doc.text(`a. Informasi Umum : 0856-9736-7832`, 1.2, 17.4);
        doc.text(`b. Putra : 0896-5479-0122`, 1.2, 17.7);
        doc.text(`c. Putri : 0822-3105-8592`, 1.2, 18);

        doc.text(`Tanggal Cetak: ${new Date().toLocaleString()}`, 12.1, 19.6);
        // doc.text(`Petugas: ${req.user.nama_lengkap}`, 12.1, 20);
      });
      // Generate PDF sebagai buffer
      const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

      // Atur header untuk pengiriman file PDF
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'inline; filename="generated.pdf"');

      // Kirim buffer PDF ke frontend
      res.send(pdfBuffer);
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
  cetakSuratPersonal: async (req, res) => {
    try {
      const data = await Santri.findOne({
        attributes: { exclude: ["raw"] },
        where: {
          uuid: req.params.uuid,
        },
        include: {
          model: Penumpang,
          as: "penumpang",
        },
      });

      const pageWidth = 16.5; // Lebar dalam cm
      const pageHeight = 21; // Tinggi dalam cm

      // Buat dokumen jsPDF
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "cm",
        format: [pageWidth, pageHeight],
      });

      const kopPath = path.join(__dirname, "../../assets", "kop.png");
      const kopBase64 = fs.readFileSync(kopPath, "base64");
      const qrPath = path.join(__dirname, "../../assets", "ttd-qr.png");
      const qrBase64 = fs.readFileSync(qrPath, "base64");

      doc.addImage(kopBase64, "PNG", 1, 0.5, 14.5, 3);

      doc.setFont("Helvetica");
      doc.setFontSize(8);
      doc.text("SURAT IZIN LIBUR MAULID 1446 H", 8.25, 3.8, {
        align: "center",
      });

      doc.text(`NOMOR : NJ-B/0457/A.IX/09.2024`, 8.25, 4.2, {
        align: "center",
      });

      doc.text(
        `Yang bertanda tangan dibawah ini, Kepala Pondok Pesantren Nurul Jadid Paiton Probolinggo Jawa Timur `,
        1,
        4.8
      );
      doc.text(`memberikan izin libur kepada :`, 1, 5.3);

      doc.text(`NIUP : ${data.niup}`, 1, 6);
      doc.text(`Nama : ${data.nama_lengkap}`, 1, 6.4);
      doc.text(`Wilayah : ${data.wilayah}`, 1, 6.8);
      doc.text(`Daerah : ${data.blok}`, 1, 7.2);
      doc.text(
        `Alamat : ${data.kecamatan}, ${data.provinsi}, ${data.negara}`,
        1,
        7.6
      );

      doc.text(
        `Santri putri tanggal 8 Rabiul Awal 1446 H/12 September 2024 M`,
        8.25,
        8.4,
        { align: "center" }
      );
      doc.text(`s.d 17 Rabiul Awal 1446 H/21 September 2024 M.`, 8.25, 8.8, {
        align: "center",
      });
      doc.text(
        `Santri putri tanggal 9 Rabiul Awal 1446 H/13 September 2024 M`,
        8.25,
        9.2,
        { align: "center" }
      );
      doc.text(`s.d 18 Rabiul Awal 1446 H/22 September 2024 M.`, 8.25, 9.6, {
        align: "center",
      });

      doc.text(
        `Demikian surat izin ini dibuat dengan sebenarnya dan untuk digunakan sebagaimana mestinya`,
        1,
        10.1
      );
      doc.text(`Paiton,`, 1, 10.7);
      doc.text(`06 Rabiul Awal 1446 H`, 2.3, 10.7);
      doc.text(`09 September 2024 M`, 2.3, 11.1);

      doc.addImage(qrBase64, "PNG", 1, 11.5, 2.5, 2.5);
      doc.text("KH. ABD. HAMID WAHID, M.Ag.", 1, 14.7);
      doc.text("NIUP : 31820500002", 1, 15.1);

      doc.setFontSize(6);
      doc.text(`Keterangan:`, 1, 16.7);
      doc.text(
        `1. Kedatangan Santri dan penyerahan surat izin libur ke KAMTIB Wilayah/Daerah selambat-lambatnya pukul 17.00 WIB (Ba’da Maghrib).`,
        1.2,
        17.1
      );
      doc.text(`a. Informasi Umum : 0856-9736-7832`, 1.2, 17.4);
      doc.text(`b. Putra : 0896-5479-0122`, 1.2, 17.7);
      doc.text(`c. Putri : 0822-3105-8592`, 1.2, 18);

      doc.text(`Tanggal Cetak: ${new Date().toLocaleString()}`, 12.1, 19.6);
      doc.text(`Petugas: ${req.user.nama_lengkap}`, 12.1, 20);
      // });

      // Ubah ke Buffer untuk dikirim sebagai biner
      const pdfOutput = doc.output("arraybuffer"); // Menghasilkan PDF dalam format ArrayBuffer
      const buffer = Buffer.from(pdfOutput); // Ubah ArrayBuffer ke Buffer

      // Atur header untuk mengirim file PDF
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="surat_izin.pdf"'
      );

      // Kirim buffer sebagai respons
      res.send(buffer);
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
};
