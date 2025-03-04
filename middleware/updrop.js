module.exports = async (req, res, next) => {
  const tgl = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
  );
  const allowedrules = ["sysadmin", "admin"];
  if (
    tgl > new Date(process.env.TANGGAL_AKHIR_INPUT) &&
    !allowedrules.includes(req.user.role)
  ) {
    return res.status(400).json({
      status: 400,
      message: "AKSES DITUTUP",
      error: "Akses perubahan dropspot wilayah/daerah ditutup",
    });
  }
  next();
};
