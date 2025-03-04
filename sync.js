require("dotenv").config();
const axios = require("axios");
const mysql = require("mysql2/promise");

const API_URL = "https://api-pedatren.nuruljadid.app";

const config = {
  headers: {
    "x-api-key": process.env.PEDATREN_TOKEN,
  },
};

async function syncSantri() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
  });
  try {
    const { data: santriPedatren } = await axios.get(
      `${API_URL}/santri?disable_pagination=true`,
      config
    );

    console.log("Data PEDATREN : ", santriPedatren.length);

    const [santriLocal] = await db.query(
      `SELECT uuid, updated_at from santris`
    );

    console.log("Data Local : ", santriLocal.length);

    const santriPedatrenUuid = santriPedatren.map((santri) => santri.uuid);
    const santriLocalUuid = santriLocal.map((santri) => santri.uuid);

    const santriToDelete = santriLocalUuid.filter(
      (uuid) => !santriPedatrenUuid.includes(uuid)
    );

    if (santriToDelete.length > 0) {
      await db.beginTransaction();
      try {
        await db.query(
          "DELETE t FROM tujuans t JOIN penumpang p ON t.penumpangId = p.id WHERE p.santriUuid IN (?)",
          [santriToDelete]
        );
        await db.query(
          "DELETE FROM santripersyaratans WHERE santriUuid IN (?)",
          [santriToDelete]
        );
        await db.query("DELETE FROM penumpangs WHERE santriUuid IN (?)", [
          santriToDelete,
        ]);
        await db.query("DELETE FROM santris WHERE uuid IN (?)", [
          santriToDelete,
        ]);
        console.log(`Data dihapus: ${santriToDelete.join(", ")}`);
        await db.commit();
      } catch (error) {
        await db.rollback();
        console.error("Terjadi error, transaction dirollback:", error);
      }
    }

    for (const santri of santriPedatren) {
      const cekSantri = await db.query(
        "SELECT sync_time FROM santris WHERE uuid = ?",
        [santri.uuid]
      );

      // var santriSyncTime = santri.updated_at;
      // if (cekSantri[0].length > 0) {
      //   santriSyncTime = new Date(
      //     new Date(cekSantri[0][0].sync_time).getTime() + 7 * 60 * 60 * 1000
      //   ).toISOString();
      // }

      if (cekSantri[0].length === 0) {
        const resp = await axios.get(
          `${API_URL}/person/${santri.uuid}`,
          config
        );

        const person = {
          uuid: resp.data.uuid,
          nama_lengkap: resp.data.nama_lengkap,
          tanggal_lahir: resp.data.tanggal_lahir,
          tempat_lahir: resp.data.tempat_lahir,
          tempat_lahir: resp.data.tempat_lahir,
          jenis_kelamin: resp.data.jenis_kelamin,
          kecamatan: resp.data.kecamatan,
          kabupaten: resp.data.kabupaten,
          provinsi: resp.data.provinsi,
          negara: resp.data.negara,
          niup: resp.data.warga_pesantren.niup ?? null,
          foto_sm: resp.data.fotodiri.small,
          foto_md: resp.data.fotodiri.medium,
          foto_lg: resp.data.fotodiri.normal,
          wilayah: resp.data.domisili_santri
            ? resp.data.domisili_santri[resp.data.domisili_santri.length - 1]
                .wilayah
            : null,
          alias_wilayah: resp.data.domisili_santri
            ? resp.data.domisili_santri[
                resp.data.domisili_santri.length - 1
              ].wilayah
                .toLowerCase()
                .replace(/ /g, "-")
            : null,
          blok: resp.data.domisili_santri
            ? resp.data.domisili_santri[resp.data.domisili_santri.length - 1]
                .blok
            : null,
          id_blok: resp.data.domisili_santri
            ? resp.data.domisili_santri[resp.data.domisili_santri.length - 1]
                .id_blok
            : null,
          kamar: resp.data.domisili_santri
            ? resp.data.domisili_santri[resp.data.domisili_santri.length - 1]
                .kamar
            : null,
          id_kamar: resp.data.domisili_santri
            ? resp.data.domisili_santri[resp.data.domisili_santri.length - 1]
                .id_kamar
            : null,
          lembaga: resp.data.pendidikan
            ? resp.data.pendidikan[resp.data.pendidikan.length - 1].lembaga
            : null,
          id_lembaga: resp.data.pendidikan
            ? resp.data.pendidikan[resp.data.pendidikan.length - 1].id_lembaga
            : null,
          jurusan: resp.data.pendidikan
            ? resp.data.pendidikan[resp.data.pendidikan.length - 1].jurusan
            : null,
          id_jurusan: resp.data.pendidikan
            ? resp.data.pendidikan[resp.data.pendidikan.length - 1].id_jurusan
            : null,
          raw: JSON.stringify(resp.data),
          sync_time: new Date(resp.data.updated_at)
            .toISOString()
            .replace("T", " ")
            .slice(0, 19),
          created_at: new Date(resp.data.created_at)
            .toISOString()
            .replace("T", " ")
            .slice(0, 19),
          updated_at: new Date(resp.data.updated_at)
            .toISOString()
            .replace("T", " ")
            .slice(0, 19),
        };

        await db.beginTransaction();

        try {
          const keys = Object.keys(person).join(", ");
          const placeholders = Object.keys(person)
            .map(() => "?")
            .join(", ");

          const santriQuery = `INSERT INTO santris (${keys}) VALUES (${placeholders})`;
          const santriValues = Object.values(person);

          await db.execute(santriQuery, santriValues);
          console.log(
            `Data ditambahkan: ${santri.uuid} | ${santri.nama_lengkap}`
          );

          const penumpangQuery = `
          INSERT INTO penumpangs (santriUuid, createdAt, updatedAt) 
          VALUES (?, NOW(), NOW())
        `;
          const penumpangValues = [resp.data.uuid];

          await db.execute(penumpangQuery, penumpangValues);
          console.log(`Data penumpang ditambahkan: ${resp.data.uuid}`);

          // Ambil semua id dari tabel ketuntasans
          const [ketuntasans] = await db.execute("SELECT id FROM ketuntasans");

          // Insert ke tabel santripersyaratans untuk setiap ketuntasanId
          const santripersyaratanQuery = `
          INSERT INTO santripersyaratans (santriUuid, ketuntasanId, createdAt, updatedAt) 
          VALUES (?, ?, NOW(), NOW())
        `;

          for (const ketuntasan of ketuntasans) {
            const santripersyaratanValues = [resp.data.uuid, ketuntasan.id];
            await db.execute(santripersyaratanQuery, santripersyaratanValues);
            console.log(
              `Data santripersyaratans ditambahkan: santriUuid=${resp.data.uuid}, ketuntasanId=${ketuntasan.id}`
            );
          }

          await db.commit();
        } catch (error) {
          await db.rollback();
          console.error("Terjadi error, transaction dirollback:", error);
        }
      } else if (
        new Date(cekSantri[0][0].sync_time).getTime() !==
        new Date(santri.updated_at).getTime()
      ) {
        const resp = await axios.get(
          `${API_URL}/person/${santri.uuid}`,
          config
        );

        const person = {
          uuid: resp.data.uuid,
          nama_lengkap: resp.data.nama_lengkap,
          tanggal_lahir: resp.data.tanggal_lahir,
          tempat_lahir: resp.data.tempat_lahir,
          tempat_lahir: resp.data.tempat_lahir,
          jenis_kelamin: resp.data.jenis_kelamin,
          kecamatan: resp.data.kecamatan,
          kabupaten: resp.data.kabupaten,
          provinsi: resp.data.provinsi,
          negara: resp.data.negara,
          niup: resp.data.warga_pesantren.niup ?? null,
          foto_sm: resp.data.fotodiri.small,
          foto_md: resp.data.fotodiri.medium,
          foto_lg: resp.data.fotodiri.normal,
          wilayah:
            resp.data.domisili_santri[resp.data.domisili_santri.length - 1]
              .wilayah,
          alias_wilayah: resp.data.domisili_santri[
            resp.data.domisili_santri.length - 1
          ].wilayah
            .toLowerCase()
            .replace(/ /g, "-"),
          blok: resp.data.domisili_santri[resp.data.domisili_santri.length - 1]
            .blok,
          id_blok:
            resp.data.domisili_santri[resp.data.domisili_santri.length - 1]
              .id_blok,
          kamar:
            resp.data.domisili_santri[resp.data.domisili_santri.length - 1]
              .kamar,
          id_kamar:
            resp.data.domisili_santri[resp.data.domisili_santri.length - 1]
              .id_kamar,
          lembaga:
            resp.data.pendidikan[resp.data.pendidikan.length - 1].lembaga,
          id_lembaga:
            resp.data.pendidikan[resp.data.pendidikan.length - 1].id_lembaga,
          jurusan:
            resp.data.pendidikan[resp.data.pendidikan.length - 1].jurusan,
          id_jurusan:
            resp.data.pendidikan[resp.data.pendidikan.length - 1].id_jurusan,
          raw: JSON.stringify(resp.data),
          sync_time: new Date(resp.data.updated_at)
            .toISOString()
            .replace("T", " ")
            .slice(0, 19),
          created_at: new Date(resp.data.created_at)
            .toISOString()
            .replace("T", " ")
            .slice(0, 19),
          updated_at: new Date(resp.data.updated_at)
            .toISOString()
            .replace("T", " ")
            .slice(0, 19),
        };

        const updates = Object.keys(person)
          .map((key) => `${key} = ?`)
          .join(", ");

        const query = `UPDATE santris SET ${updates} WHERE uuid = ?`;
        const values = [...Object.values(person), santri.uuid];

        await db.execute(query, values);
        console.log(`Data diperbarui: ${santri.uuid} | ${santri.nama_lengkap}`);
      }
    }
    console.log("Data is up to date to PEDATREN Service");
  } catch (err) {
    console.log(API_URL);
    console.log(config);

    console.log(err.response ? err.response.data : err.message);
  }
}

syncSantri();
