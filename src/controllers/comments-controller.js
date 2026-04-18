const { asyncHandler } = require("../utils/async-handler");
const { validatePositiveId } = require("../validators/common");
const {
  addCommentToVideo,
  listCommentsForVideo,
} = require("../services/comments-service");
const { validateCommentCreateInput } = require("../validators/comments");

const listComments = asyncHandler(async (req, res) => {
  const videoId = validatePositiveId(req.params.videoId, "video id");
  const comments = await listCommentsForVideo(videoId);

  res.json({ comments });
});

const createComment = asyncHandler(async (req, res) => {
  const videoId = validatePositiveId(req.params.videoId, "video id");
  const payload = validateCommentCreateInput(req.body);
  const comment = await addCommentToVideo({
    videoId,
    userId: req.auth.sub,
    body: payload.body,
  });

  res.status(201).json({ comment });
});

module.exports = {
  createComment,
  listComments,
};
