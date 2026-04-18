const express = require("express");
const { adminRouter } = require("./admin");
const { bossAdsRouter, publicAdsRouter } = require("./ads");
const { authRouter } = require("./auth");
const { auditRouter } = require("./audit");
const { commentsRouter } = require("./comments");
const { reactionsRouter } = require("./reactions");
const { videosRouter } = require("./videos");

const apiRouter = express.Router();

apiRouter.get("/", (_req, res) => {
  res.json({
    message: "FoydaTube API v1",
  });
});
apiRouter.use("/auth", authRouter);
apiRouter.use("/ads", publicAdsRouter);
apiRouter.use("/videos", videosRouter);
apiRouter.use("/videos", commentsRouter);
apiRouter.use("/videos", reactionsRouter);
apiRouter.use("/boss", adminRouter);
apiRouter.use("/boss/ads", bossAdsRouter);
apiRouter.use("/boss/audit-logs", auditRouter);

module.exports = { apiRouter };
