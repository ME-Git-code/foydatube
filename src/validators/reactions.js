const { createHttpError } = require("../utils/http-error");

const ALLOWED_REACTIONS = ["like", "useful", "inspiring"];

function validateReactionInput(payload) {
  const reaction = String(payload.reaction || "").trim().toLowerCase();

  if (!ALLOWED_REACTIONS.includes(reaction)) {
    throw createHttpError(
      400,
      `Reaction must be one of: ${ALLOWED_REACTIONS.join(", ")}`,
    );
  }

  return { reaction };
}

module.exports = {
  ALLOWED_REACTIONS,
  validateReactionInput,
};
