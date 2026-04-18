const { createHttpError } = require("../utils/http-error");
const { createAuditLog } = require("../repositories/audit-repository");
const {
  createAd,
  deleteAd,
  findAdById,
  listActiveAdsByPlacement,
  listAllAds,
  updateAd,
} = require("../repositories/ads-repository");

async function getAllAds() {
  return listAllAds();
}

async function getPublicAds(placement) {
  return listActiveAdsByPlacement(placement);
}

async function createManagedAd({ actorUserId, actorRole, payload }) {
  const ad = await createAd({
    ...payload,
    createdBy: actorUserId,
  });

  await createAuditLog({
    actorUserId,
    actorRole,
    action: "ads.create",
    targetType: "ad",
    targetId: ad.id,
    details: {
      placement: ad.placement,
      adType: ad.ad_type,
      isActive: ad.is_active,
    },
  });

  return ad;
}

async function updateManagedAd({ adId, actorUserId, actorRole, patch }) {
  const existing = await findAdById(adId);
  if (!existing) {
    throw createHttpError(404, "Ad not found");
  }

  const updated = await updateAd(adId, patch);

  await createAuditLog({
    actorUserId,
    actorRole,
    action: "ads.update",
    targetType: "ad",
    targetId: adId,
    details: {
      patch,
    },
  });

  return updated;
}

async function removeManagedAd({ adId, actorUserId, actorRole }) {
  const deleted = await deleteAd(adId);
  if (!deleted) {
    throw createHttpError(404, "Ad not found");
  }

  await createAuditLog({
    actorUserId,
    actorRole,
    action: "ads.delete",
    targetType: "ad",
    targetId: adId,
    details: {
      placement: deleted.placement,
      adType: deleted.ad_type,
    },
  });

  return deleted;
}

module.exports = {
  createManagedAd,
  getAllAds,
  getPublicAds,
  removeManagedAd,
  updateManagedAd,
};
