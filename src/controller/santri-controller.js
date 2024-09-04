const { Op } = require("sequelize");
const {
  Santri,
  SantriPersyaratan,
  Penumpang,
  Tujuan,
  Dropspot,
  Area,
  sequelize,
} = require("../../models");
const axios = require("axios");

async function processDataSantri(uuid) {
  const transaction = await sequelize.transaction();
  try {
    const response = await axios.get(
      `${process.env.PEDATREN_URL}/person/${uuid}`,
      {
        headers: {
          "x-api-key": process.env.PEDATREN_TOKEN,
        },
      }
    );

    await Santri.create(
      {
        uuid: response.data.uuid,
        niup: response.data.warga_pesantren.niup
          ? response.data.warga_pesantren.niup
          : null,
        nama_lengkap: response.data.nama_lengkap,
        jenis_kelamin: response.data.jenis_kelamin,
        negara: response.data.negara ? response.data.negara : null,
        provinsi: response.data.provinsi ? response.data.provinsi : null,
        kabupaten: response.data.kabupaten ? response.data.kabupaten : null,
        kecamatan: response.data.kecamatan ? response.data.kecamatan : null,
        wilayah: response.data.domisili_santri
          ? response.data.domisili_santri[
              response.data.domisili_santri.length - 1
            ].wilayah
          : null,
        alias_wilayah: response.data.domisili_santri
          ? response.data.domisili_santri[
              response.data.domisili_santri.length - 1
            ].wilayah
              .toLowerCase()
              .replace(/ /g, "-")
          : null,
        blok: response.data.domisili_santri
          ? response.data.domisili_santri[
              response.data.domisili_santri.length - 1
            ].blok
          : null,
        id_blok: response.data.domisili_santri
          ? response.data.domisili_santri[
              response.data.domisili_santri.length - 1
            ].id_blok
          : null,
        raw: JSON.stringify(response.data),
      },
      { transaction }
    );

    await Penumpang.create(
      {
        santriUuid: response.data.uuid,
      },
      { transaction }
    );

    await transaction.commit();
    return true;
  } catch (err) {
    await transaction.rollback();
    console.log(uuid + " : " + err.message);
    return false;
  }
}
async function processDeleteSantri(uuid) {
  const transaction = await sequelize.transaction();
  try {
    const penumpang = await Penumpang.findOne({
      where: {
        santriUuid: uuid,
      },
    });

    await Tujuan.destroy(
      { where: { penumpangId: penumpang.id } },
      { transaction }
    );

    await penumpang.destroy({ transaction: transaction });

    await SantriPersyaratan.destroy(
      { where: { santriUuid: uuid } },
      { transaction }
    );
    await Santri.destroy({ where: { uuid: uuid } }, { transaction });

    await transaction.commit();
    return true;
  } catch (err) {
    await transaction.rollback();
    console.log(uuid + " : " + err.message);
    return false;
  }
}

function getDataBaru(dataApi, dataDb) {
  return dataApi
    .filter((itemApi) => !dataDb.some((itemDb) => itemDb.uuid === itemApi.uuid))
    .map((item) => item.uuid);
}

function getDataExpired(dataApi, dataDb) {
  return dataDb
    .filter(
      (itemDb) => !dataApi.some((itemApi) => itemApi.uuid === itemDb.uuid)
    )
    .map((item) => item.uuid);
}

module.exports = {
  generateSantri: async (req, res) => {
    try {
      let totalBerhasilTambah = 0;
      let totalGagalTambah = 0;
      let totalBerhasilDestroy = 0;
      let totalGagalDestroy = 0;

      const dataPedateren = await axios.get(
        `${process.env.PEDATREN_URL}/santri`,
        {
          headers: {
            "x-api-key": process.env.PEDATREN_TOKEN,
          },
          params: {
            disable_pagination: true,
          },
        }
      );

      const dataDb = await Santri.findAll({
        attributes: ["uuid"],
      });

      const dataBaru = getDataBaru(dataPedateren.data, dataDb);
      const dataExpired = getDataExpired(dataPedateren.data, dataDb);
      const resultTambah = await Promise.all(
        dataBaru.map((d) => processDataSantri(d))
      );
      const resultDestroy = await Promise.all(
        dataExpired.map((d) => processDeleteSantri(d))
      );

      const berhasilTambah = resultTambah.filter((resultT) => resultT).length;
      const gagalTambah = resultTambah.filter((resultT) => !resultT).length;
      const berhasilDestroy = resultDestroy.filter((resultD) => resultD).length;
      const gagalDestory = resultDestroy.filter((resultD) => !resultD).length;

      totalBerhasilTambah += berhasilTambah;
      totalGagalTambah += gagalTambah;
      totalBerhasilDestroy += berhasilDestroy;
      totalGagalDestroy += gagalDestory;

      console.log(
        `didapat data baru : ${dataBaru.length} - diproses data baru  : ${resultTambah.length} | berhasil(${berhasilTambah})/gagal(${gagalTambah})`
      );

      console.log(
        `Total berhasil data baru : ${totalBerhasilTambah}, Total gagal data baru : ${totalGagalTambah}`
      );

      console.log(
        `didapat data expired : ${dataExpired.length} - diproses data expired : ${resultDestroy.length} | berhasil(${berhasilDestroy})/gagal(${gagalDestory})`
      );

      console.log(
        `Total berhasil data expired: ${totalBerhasilDestroy}, Total gagal: ${totalGagalDestroy}`
      );

      return res.status(200).json({
        status: 20,
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
          [Op.or]: {
            nama_lengkap: {
              [Op.like]: `%${search}%`,
            },
            niup: {
              [Op.like]: `%${search}%`,
            },
          },
          ...(req.user.user.role === "daerah" && { id_blok: req.id_blok }),
          ...(req.user.user.role === "wilayah" && {
            alias_wilayah: req.wilayah,
          }),
          ...(req.query.wilayah && { alias_wilayah: req.query.wilayah }),
          ...(req.query.blok && { id_blok: req.query.blok }),
          ...(req.query.jenis_kelamin && {
            jenis_kelamin: req.query.jenis_kelamin,
          }),
        },
        include: [
          {
            model: Penumpang,
            attributes: [
              "id",
              "santriUuid",
              "statusKepulangan",
              "statusRombongan",
            ],
            as: "penumpang",
            where: {
              ...(req.query.status_pulang && {
                statusKepulangan: req.query.status_pulang,
              }),
              ...(req.query.status_rombongan && {
                statusRombongan: req.query.status_rombongan,
              }),
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
  getByUuid: async (req, res) => {
    try {
      // get data from database
      const data = await Santri.findOne({
        where: {
          uuid: req.params.uuid,
        },
        include: [
          {
            model: Penumpang,
            as: "penumpang",
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
          },
        ],
      });
      if (!data) {
        return res.status(404).json({
          status: 404,
          message: "NOT FOUND",
          error: `santri tidak ditemukan`,
        });
      }
      data.raw = JSON.parse(data.raw);
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
  getDomisili: async (req, res) => {
    try {
      let data;
      // get data from database
      if (req.user.role == "wilayah") {
        data = await sequelize.query(
          `SELECT wilayah, alias_wilayah, JSON_ARRAYAGG( JSON_OBJECT('id_blok', id_blok, 'blok', blok) ) AS data_blok FROM santris WHERE alias_wilayah IS NOT NULL' GROUP BY wilayah, alias_wilayah ORDER BY CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(wilayah, '(', -1), ')', 1) AS UNSIGNED);`
        );
      } else if (req.user.role == "wilayah") {
        data = await sequelize.query(
          `SELECT wilayah, alias_wilayah, JSON_ARRAYAGG( JSON_OBJECT('id_blok', id_blok, 'blok', blok) ) AS data_blok FROM santris WHERE alias_wilayah IS NOT NULL' GROUP BY wilayah, alias_wilayah ORDER BY CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(wilayah, '(', -1), ')', 1) AS UNSIGNED);`
        );
      } else {
        data = await sequelize.query(
          `SELECT wilayah, alias_wilayah, JSON_ARRAYAGG( JSON_OBJECT('id_blok', id_blok, 'blok', blok) ) AS data_blok FROM santris WHERE alias_wilayah IS NOT NULL GROUP BY wilayah, alias_wilayah ORDER BY CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(wilayah, '(', -1), ')', 1) AS UNSIGNED);`
        );
      }
      return res.status(200).json({
        status: 200,
        message: "OK",
        data: data[0],
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
