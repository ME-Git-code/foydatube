const { findApprovedVideoById } = require("../repositories/videos-repository");
const {
  deleteVideoReaction,
  getReactionSummaryForVideo,
  getUserReactionForVideo,
  upsertVideoReaction,
} = require("../repositories/reactions-repository");
const { createHttpError } = require("../utils/http-error");

function buildSummaryMap(rows) {
  const summary = {
    like: 0,
    useful: 0,
    inspiring: 0,
    total: 0,
  };

  for (const row of rows) {
    summary[row.reaction] = row.count;
    summary.total += row.count;
  }

  return summary;
}

async function addReactionToVideo({ videoId, userId, reaction }) {
  const video = await findApprovedVideoById(videoId);

  if (!video) {
    throw createHttpError(404, "Approved video not found");
  }

  const reactionRecord = await upsertVideoReaction({
    videoId,
    userId,
    reaction,
  });
  const summaryRows = await getReactionSummaryForVideo(videoId);

  return {
    reaction: reactionRecord,
    summary: buildSummaryMap(summaryRows),
  };
}

async function removeReactionFromVideo({ videoId, userId }) {
  const video = await findApprovedVideoById(videoId);

  if (!video) {
    throw createHttpError(404, "Approved video not found");
  }

  await deleteVideoReaction({
    videoId,
    userId,
  });

  const summaryRows = await getReactionSummaryForVideo(videoId);

  return {
    removed: true,
    summary: buildSummaryMap(summaryRows),
  };
}

async function getReactionStateForUser({ videoId, userId }) {
  const summaryRows = await getReactionSummaryForVideo(videoId);
  const userReaction = await getUserReactionForVideo({ videoId, userId });

  return {
    userReaction: userReaction ? userReaction.reaction : null,
    summary: buildSummaryMap(summaryRows),
  };
}

module.exports = {
  addReactionToVideo,
  getReactionStateForUser,
  removeReactionFromVideo,
};
