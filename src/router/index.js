const { Router } = require("express");
const authRouter = require("./auth");
const areaRouter = require("./area");
const dropspotRouter = require("./dropspot");

const auth = require("../../middleware/authentication");

const router = Router();

router.use("/", authRouter);
router.use("/area", auth, areaRouter);
router.use("/dropspot", auth, dropspotRouter);

module.exports = router;
