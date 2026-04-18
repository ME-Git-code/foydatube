const { createHttpError } = require("../utils/http-error");

function validateVideoCreateInput(payload) {
  const title = String(payload.title || "").trim();
  const description = String(payload.description || "").trim();
  const category = payload.category ? String(payload.category).trim() : null;
  const videoUrl = String(payload.videoUrl || "").trim();
  const thumbnailUrl = payload.thumbnailUrl
    ? String(payload.thumbnailUrl).trim()
    : null;

  if (title.length < 3 || title.length > 180) {
    throw createHttpError(400, "Title must be between 3 and 180 characters");
  }

  if (description.length < 10) {
    throw createHttpError(400, "Description must be at least 10 characters");
  }

  if (!videoUrl) {
    throw createHttpError(400, "Video URL is required");
  }

  return {
    title,
    description,
    category,
    videoUrl,
    thumbnailUrl,
  };
}

function validateModerationInput(payload) {
  const feedback = payload.feedback ? String(payload.feedback).trim() : null;
  const rejectionReason = payload.rejectionReason
    ? String(payload.rejectionReason).trim()
    : null;
  const points = payload.points == null ? null : Number(payload.points);

  if (points != null && (!Number.isInteger(points) || points <= 0)) {
    throw createHttpError(400, "Points must be a positive integer");
  }

  return {
    feedback,
    rejectionReason,
    points,
  };
}

module.exports = {
  validateModerationInput,
  validateVideoCreateInput,
};
