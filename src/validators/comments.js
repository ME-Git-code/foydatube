const { createHttpError } = require("../utils/http-error");

function validateCommentCreateInput(payload) {
  const body = String(payload.body || "").trim();

  if (body.length < 1) {
    throw createHttpError(400, "Comment body is required");
  }

  if (body.length > 1000) {
    throw createHttpError(400, "Comment body must be 1000 characters or less");
  }

  return { body };
}

module.exports = {
  validateCommentCreateInput,
};
