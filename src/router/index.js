const { Router } = require("express");
const authRouter = require("./auth");
const areaRouter = require("./area");
const dropspotRouter = require("./dropspot");
const santriRouter = require("./santri");

const auth = require("../../middleware/authentication");

const router = Router();

router.use("/", authRouter);
router.use("/area", auth, areaRouter);
router.use("/dropspot", auth, dropspotRouter);
router.use("/santri", auth, santriRouter);

module.exports = router;
