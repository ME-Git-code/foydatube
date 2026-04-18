const { createHttpError } = require("../utils/http-error");

function validatePositiveId(value, fieldName = "id") {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw createHttpError(400, `Valid ${fieldName} is required`);
  }

  return id;
}

module.exports = {
  validatePositiveId,
};
