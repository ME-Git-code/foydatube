const { asyncHandler } = require("../utils/async-handler");
const { validatePositiveId } = require("../validators/common");
const {
  ALLOWED_PLACEMENTS,
  validateAdInput,
  validateAdPatchInput,
} = require("../validators/ads");
const { createHttpError } = require("../utils/http-error");
const {
  createManagedAd,
  getAllAds,
  getPublicAds,
  removeManagedAd,
  updateManagedAd,
} = require("../services/ads-service");

const listPublicAds = asyncHandler(async (req, res) => {
  const placement = String(req.query.placement || "").trim().toLowerCase();

  if (!ALLOWED_PLACEMENTS.includes(placement)) {
    throw createHttpError(
      400,
      `Placement must be one of: ${ALLOWED_PLACEMENTS.join(", ")}`,
    );
  }

  const ads = await getPublicAds(placement);

  res.json({ ads });
});

const listManagedAds = asyncHandler(async (_req, res) => {
  const ads = await getAllAds();

  res.json({ ads });
});

const createAd = asyncHandler(async (req, res) => {
  const payload = validateAdInput(req.body);
  const ad = await createManagedAd({
    actorUserId: req.auth.sub,
    actorRole: req.auth.role,
    payload,
  });

  res.status(201).json({ ad });
});

const patchAd = asyncHandler(async (req, res) => {
  const adId = validatePositiveId(req.params.adId, "ad id");
  const patch = validateAdPatchInput(req.body);
  const ad = await updateManagedAd({
    adId,
    actorUserId: req.auth.sub,
    actorRole: req.auth.role,
    patch,
  });

  res.json({ ad });
});

const removeAd = asyncHandler(async (req, res) => {
  const adId = validatePositiveId(req.params.adId, "ad id");
  const ad = await removeManagedAd({
    adId,
    actorUserId: req.auth.sub,
    actorRole: req.auth.role,
  });

  res.json({ ad });
});

module.exports = {
  createAd,
  listManagedAds,
  listPublicAds,
  patchAd,
  removeAd,
};
