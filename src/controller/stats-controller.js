const { sequelize } = require("../../models");

module.exports = {
  // list all data
  byDropspotPaPi: async (req, res) => {
    try {
      const data = await sequelize.query(`SELECT 
    A.id AS area_id,
    A.namaArea,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'dropspot_id', dropspots.dropspot_id,
            'namaDropspot', dropspots.namaDropspot,
            'harga', dropspots.harga,
            'jumlah_penumpang', dropspots.jumlah_penumpang,
            'jumlah_penumpang_putra', dropspots.jumlah_penumpang_putra,
            'jumlah_penumpang_putri', dropspots.jumlah_penumpang_putri
        )
    ) AS dropspots
FROM 
    areas A
JOIN (
    SELECT 
        D.id AS dropspot_id,
        D.namaDropspot,
        D.areaId,
        D.harga,
        COUNT(P.id) AS jumlah_penumpang,
        COUNT(CASE WHEN S.jenis_kelamin = 'L' THEN 1 END) AS jumlah_penumpang_putra,
        COUNT(CASE WHEN S.jenis_kelamin = 'P' THEN 1 END) AS jumlah_penumpang_putri
    FROM 
        dropspots D
    LEFT JOIN 
        penumpangs P ON D.id = P.dropspotId
    LEFT JOIN 
        santris S ON P.santriUuid = S.uuid
    GROUP BY 
        D.id, D.namaDropspot, D.areaId, D.harga
) AS dropspots ON A.id = dropspots.areaId
GROUP BY 
    A.id, A.namaArea
ORDER BY 
    A.id;
`);
      res.status(200).json(data[0]);
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: "INTERNAL SERVER ERROR",
        error: err.message,
      });
    }
  },
};
