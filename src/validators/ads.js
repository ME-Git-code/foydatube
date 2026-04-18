const { createHttpError } = require("../utils/http-error");

const ALLOWED_AD_TYPES = ["banner", "video"];
const ALLOWED_PLACEMENTS = ["home_feed", "video_detail", "sidebar"];

function normalizeOptionalString(value) {
  if (value == null) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized ? normalized : null;
}

function validateAdInput(payload) {
  const title = String(payload.title || "").trim();
  const adType = String(payload.adType || "").trim().toLowerCase();
  const mediaUrl = String(payload.mediaUrl || "").trim();
  const targetUrl = normalizeOptionalString(payload.targetUrl);
  const placement = String(payload.placement || "").trim().toLowerCase();
  const isActive = payload.isActive == null ? true : Boolean(payload.isActive);
  const startsAt = normalizeOptionalDate(payload.startsAt, "startsAt");
  const endsAt = normalizeOptionalDate(payload.endsAt, "endsAt");

  if (!title || title.length > 180) {
    throw createHttpError(400, "Ad title is required and must be 180 characters or less");
  }

  if (!ALLOWED_AD_TYPES.includes(adType)) {
    throw createHttpError(400, `Ad type must be one of: ${ALLOWED_AD_TYPES.join(", ")}`);
  }

  if (!mediaUrl) {
    throw createHttpError(400, "Media URL is required");
  }

  if (!ALLOWED_PLACEMENTS.includes(placement)) {
    throw createHttpError(
      400,
      `Placement must be one of: ${ALLOWED_PLACEMENTS.join(", ")}`,
    );
  }

  if (startsAt && endsAt && startsAt > endsAt) {
    throw createHttpError(400, "startsAt must be before endsAt");
  }

  return {
    title,
    adType,
    mediaUrl,
    targetUrl,
    placement,
    isActive,
    startsAt: startsAt ? startsAt.toISOString() : null,
    endsAt: endsAt ? endsAt.toISOString() : null,
  };
}

function validateAdPatchInput(payload) {
  const next = {};

  if ("title" in payload) {
    next.title = String(payload.title || "").trim();
    if (!next.title || next.title.length > 180) {
      throw createHttpError(400, "Ad title must be 180 characters or less");
    }
  }

  if ("adType" in payload) {
    next.adType = String(payload.adType || "").trim().toLowerCase();
    if (!ALLOWED_AD_TYPES.includes(next.adType)) {
      throw createHttpError(400, `Ad type must be one of: ${ALLOWED_AD_TYPES.join(", ")}`);
    }
  }

  if ("mediaUrl" in payload) {
    next.mediaUrl = String(payload.mediaUrl || "").trim();
    if (!next.mediaUrl) {
      throw createHttpError(400, "Media URL is required");
    }
  }

  if ("targetUrl" in payload) {
    next.targetUrl = normalizeOptionalString(payload.targetUrl);
  }

  if ("placement" in payload) {
    next.placement = String(payload.placement || "").trim().toLowerCase();
    if (!ALLOWED_PLACEMENTS.includes(next.placement)) {
      throw createHttpError(
        400,
        `Placement must be one of: ${ALLOWED_PLACEMENTS.join(", ")}`,
      );
    }
  }

  if ("isActive" in payload) {
    next.isActive = Boolean(payload.isActive);
  }

  if ("startsAt" in payload) {
    const startsAt = normalizeOptionalDate(payload.startsAt, "startsAt");
    next.startsAt = startsAt ? startsAt.toISOString() : null;
  }

  if ("endsAt" in payload) {
    const endsAt = normalizeOptionalDate(payload.endsAt, "endsAt");
    next.endsAt = endsAt ? endsAt.toISOString() : null;
  }

  if (!Object.keys(next).length) {
    throw createHttpError(400, "At least one ad field must be provided");
  }

  if (
    Object.prototype.hasOwnProperty.call(next, "startsAt") &&
    Object.prototype.hasOwnProperty.call(next, "endsAt") &&
    next.startsAt &&
    next.endsAt &&
    new Date(next.startsAt) > new Date(next.endsAt)
  ) {
    throw createHttpError(400, "startsAt must be before endsAt");
  }

  return next;
}

function normalizeOptionalDate(value, fieldName) {
  if (value == null || value === "") {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw createHttpError(400, `${fieldName} must be a valid date`);
  }

  return date;
}

module.exports = {
  ALLOWED_AD_TYPES,
  ALLOWED_PLACEMENTS,
  validateAdInput,
  validateAdPatchInput,
};
