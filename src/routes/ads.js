const express = require("express");

const {
  createAd,
  listManagedAds,
  listPublicAds,
  patchAd,
  removeAd,
} = require("../controllers/ads-controller");
const { ROLES } = require("../constants/roles");
const { requireAuth, requireRole } = require("../middleware/auth");

const publicAdsRouter = express.Router();
const bossAdsRouter = express.Router();

publicAdsRouter.get("/", listPublicAds);

bossAdsRouter.use(requireAuth, requireRole(ROLES.BOSS));
bossAdsRouter.get("/", listManagedAds);
bossAdsRouter.post("/", createAd);
bossAdsRouter.patch("/:adId", patchAd);
bossAdsRouter.delete("/:adId", removeAd);

module.exports = {
  bossAdsRouter,
  publicAdsRouter,
};
