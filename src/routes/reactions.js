const express = require("express");

const {
  myReactionState,
  reactToVideo,
  unreactToVideo,
} = require("../controllers/reactions-controller");
const { requireAuth, requireVerifiedEmail } = require("../middleware/auth");

const reactionsRouter = express.Router();

reactionsRouter.get("/:videoId/reaction", requireAuth, myReactionState);
reactionsRouter.post("/:videoId/reaction", requireAuth, requireVerifiedEmail, reactToVideo);
reactionsRouter.delete("/:videoId/reaction", requireAuth, requireVerifiedEmail, unreactToVideo);

module.exports = { reactionsRouter };
