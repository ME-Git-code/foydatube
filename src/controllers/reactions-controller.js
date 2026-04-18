const { asyncHandler } = require("../utils/async-handler");
const { validatePositiveId } = require("../validators/common");
const { validateReactionInput } = require("../validators/reactions");
const {
  addReactionToVideo,
  getReactionStateForUser,
  removeReactionFromVideo,
} = require("../services/reactions-service");

const reactToVideo = asyncHandler(async (req, res) => {
  const videoId = validatePositiveId(req.params.videoId, "video id");
  const payload = validateReactionInput(req.body);
  const result = await addReactionToVideo({
    videoId,
    userId: req.auth.sub,
    reaction: payload.reaction,
  });

  res.json(result);
});

const unreactToVideo = asyncHandler(async (req, res) => {
  const videoId = validatePositiveId(req.params.videoId, "video id");
  const result = await removeReactionFromVideo({
    videoId,
    userId: req.auth.sub,
  });

  res.json(result);
});

const myReactionState = asyncHandler(async (req, res) => {
  const videoId = validatePositiveId(req.params.videoId, "video id");
  const result = await getReactionStateForUser({
    videoId,
    userId: req.auth.sub,
  });

  res.json(result);
});

module.exports = {
  myReactionState,
  reactToVideo,
  unreactToVideo,
};
