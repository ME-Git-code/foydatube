const { createHttpError } = require("../utils/http-error");

function validateAdminPermissionInput(payload) {
  const canReviewVideos = payload.canReviewVideos == null
    ? true
    : Boolean(payload.canReviewVideos);
  const canManageComments = payload.canManageComments == null
    ? false
    : Boolean(payload.canManageComments);
  const canAwardPoints = payload.canAwardPoints == null
    ? true
    : Boolean(payload.canAwardPoints);
  const canManageAds = payload.canManageAds == null
    ? false
    : Boolean(payload.canManageAds);

  return {
    canReviewVideos,
    canManageComments,
    canAwardPoints,
    canManageAds,
  };
}

function validateAdminTargetId(value) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw createHttpError(400, "Valid user id is required");
  }

  return id;
}

module.exports = {
  validateAdminPermissionInput,
  validateAdminTargetId,
};
