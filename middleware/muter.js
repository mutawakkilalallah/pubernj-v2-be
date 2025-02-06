// Konfigurasi Multer untuk menyimpan file yang diunggah
const multer = require("multer");
const storage = multer.memoryStorage();
const uploadMlt = multer({ storage: storage });

module.exports = uploadMlt;
