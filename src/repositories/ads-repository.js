const { getPool } = require("../config/db");

async function createAd({
  title,
  adType,
  mediaUrl,
  targetUrl,
  placement,
  isActive,
  startsAt,
  endsAt,
  createdBy,
}) {
  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO ads (title, ad_type, media_url, target_url, placement, is_active, starts_at, ends_at, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, title, ad_type, media_url, target_url, placement, is_active,
               starts_at, ends_at, created_by, created_at, updated_at`,
    [title, adType, mediaUrl, targetUrl, placement, isActive, startsAt, endsAt, createdBy],
  );

  return result.rows[0];
}

async function findAdById(adId) {
  const pool = getPool();
  const result = await pool.query(
    `SELECT id, title, ad_type, media_url, target_url, placement, is_active,
            starts_at, ends_at, created_by, created_at, updated_at
     FROM ads
     WHERE id = $1
     LIMIT 1`,
    [adId],
  );

  return result.rows[0] || null;
}

async function listAllAds() {
  const pool = getPool();
  const result = await pool.query(
    `SELECT id, title, ad_type, media_url, target_url, placement, is_active,
            starts_at, ends_at, created_by, created_at, updated_at
     FROM ads
     ORDER BY created_at DESC`,
    [],
  );

  return result.rows;
}

async function listActiveAdsByPlacement(placement) {
  const pool = getPool();
  const result = await pool.query(
    `SELECT id, title, ad_type, media_url, target_url, placement, is_active,
            starts_at, ends_at, created_by, created_at, updated_at
     FROM ads
     WHERE placement = $1
       AND is_active = TRUE
       AND (starts_at IS NULL OR starts_at <= NOW())
       AND (ends_at IS NULL OR ends_at >= NOW())
     ORDER BY created_at DESC`,
    [placement],
  );

  return result.rows;
}

async function updateAd(adId, patch) {
  const pool = getPool();
  const fields = [];
  const values = [];
  let index = 1;

  const map = {
    title: "title",
    adType: "ad_type",
    mediaUrl: "media_url",
    targetUrl: "target_url",
    placement: "placement",
    isActive: "is_active",
    startsAt: "starts_at",
    endsAt: "ends_at",
  };

  for (const [key, column] of Object.entries(map)) {
    if (Object.prototype.hasOwnProperty.call(patch, key)) {
      fields.push(`${column} = $${index}`);
      values.push(patch[key]);
      index += 1;
    }
  }

  fields.push(`updated_at = NOW()`);
  values.push(adId);

  const result = await pool.query(
    `UPDATE ads
     SET ${fields.join(", ")}
     WHERE id = $${index}
     RETURNING id, title, ad_type, media_url, target_url, placement, is_active,
               starts_at, ends_at, created_by, created_at, updated_at`,
    values,
  );

  return result.rows[0] || null;
}

async function deleteAd(adId) {
  const pool = getPool();
  const result = await pool.query(
    `DELETE FROM ads
     WHERE id = $1
     RETURNING id, title, ad_type, media_url, target_url, placement, is_active,
               starts_at, ends_at, created_by, created_at, updated_at`,
    [adId],
  );

  return result.rows[0] || null;
}

module.exports = {
  createAd,
  deleteAd,
  findAdById,
  listActiveAdsByPlacement,
  listAllAds,
  updateAd,
};
