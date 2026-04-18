const express = require("express");

const {
  createComment,
  listComments,
} = require("../controllers/comments-controller");
const { requireAuth, requireVerifiedEmail } = require("../middleware/auth");

const commentsRouter = express.Router();

commentsRouter.get("/:videoId/comments", listComments);
commentsRouter.post("/:videoId/comments", requireAuth, requireVerifiedEmail, createComment);

module.exports = { commentsRouter };
