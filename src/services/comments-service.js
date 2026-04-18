const { findApprovedVideoById } = require("../repositories/videos-repository");
const {
  createComment,
  listVisibleCommentsByVideo,
} = require("../repositories/comments-repository");
const { createHttpError } = require("../utils/http-error");

async function listCommentsForVideo(videoId) {
  const video = await findApprovedVideoById(videoId);

  if (!video) {
    throw createHttpError(404, "Approved video not found");
  }

  return listVisibleCommentsByVideo(videoId);
}

async function addCommentToVideo({ videoId, userId, body }) {
  const video = await findApprovedVideoById(videoId);

  if (!video) {
    throw createHttpError(404, "Approved video not found");
  }

  return createComment({
    videoId,
    userId,
    body,
  });
}

module.exports = {
  addCommentToVideo,
  listCommentsForVideo,
};
