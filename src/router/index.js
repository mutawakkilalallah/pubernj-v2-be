const { Router } = require("express");
const areaRouter = require("./area");
const dropspotRouter = require("./dropspot");

const router = Router();

router.use("/area", areaRouter);
router.use("/dropspot", dropspotRouter);

module.exports = router;
