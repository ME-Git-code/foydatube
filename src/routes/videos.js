const express = require("express");

const {
  approveVideo,
  createVideo,
  myVideos,
  pendingVideos,
  publicVideoDetail,
  publicVideos,
  rejectVideo,
} = require("../controllers/videos-controller");
const { requireAuth, requireRole, requireVerifiedEmail } = require("../middleware/auth");
const { ROLES } = require("../constants/roles");

const videosRouter = express.Router();

videosRouter.get("/", publicVideos);
videosRouter.get("/mine", requireAuth, myVideos);
videosRouter.get(
  "/pending",
  requireAuth,
  requireRole(ROLES.ADMIN, ROLES.BOSS),
  pendingVideos,
);
videosRouter.post(
  "/:videoId/approve",
  requireAuth,
  requireRole(ROLES.ADMIN, ROLES.BOSS),
  approveVideo,
);
videosRouter.post(
  "/:videoId/reject",
  requireAuth,
  requireRole(ROLES.ADMIN, ROLES.BOSS),
  rejectVideo,
);
videosRouter.get("/:videoId", publicVideoDetail);
videosRouter.post("/", requireAuth, requireVerifiedEmail, createVideo);

module.exports = { videosRouter };
