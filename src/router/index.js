const { Router } = require("express");
const authRouter = require("./auth");
const areaRouter = require("./area");
const dropspotRouter = require("./dropspot");
const santriRouter = require("./santri");
const penumpangRouter = require("./penumpang");
const armadaRouter = require("./armada");
const pendampingRouter = require("./pendamping");
const transportRouter = require("./transport");
const ruteRouter = require("./rute");
const kloterRouter = require("./kloter");
const ticketRouter = require("./ticket");
const ketuntasanRouter = require("./ketuntasan");
const pembayaranRouter = require("./pembayaran");
const persyaratanRouter = require("./persyaratan");
const statsRouter = require("./stats");
const userRouter = require("./user");

const auth = require("../../middleware/authentication");

const router = Router();

router.use("/", authRouter);
router.use("/area", auth, areaRouter);
router.use("/dropspot", auth, dropspotRouter);
router.use("/santri", auth, santriRouter);
router.use("/penumpang", auth, penumpangRouter);
router.use("/armada", auth, armadaRouter);
router.use("/pendamping", auth, pendampingRouter);
router.use("/transportasi", auth, transportRouter);
router.use("/rute", auth, ruteRouter);
router.use("/kloter", auth, kloterRouter);
router.use("/ticket", auth, ticketRouter);
router.use("/ketuntasan", auth, ketuntasanRouter);
router.use("/pembayaran", auth, pembayaranRouter);
router.use("/persyaratan", auth, persyaratanRouter);
router.use("/statistik", auth, statsRouter);
router.use("/user", auth, userRouter);

module.exports = router;
