const { getPool } = require("../config/db");

function emptyReactionSummary() {
  return {
    like: 0,
    useful: 0,
    inspiring: 0,
    total: 0,
  };
}

function attachReactionSummaries(videos, summaryRows) {
  const grouped = new Map();

  for (const row of summaryRows) {
    const videoId = Number(row.video_id);
    if (!grouped.has(videoId)) {
      grouped.set(videoId, emptyReactionSummary());
    }

    const current = grouped.get(videoId);
    current[row.reaction] = row.count;
    current.total += row.count;
  }

  return videos.map((video) => ({
    ...video,
    reaction_summary: grouped.get(Number(video.id)) || emptyReactionSummary(),
  }));
}

async function createVideo({
  userId,
  title,
  description,
  category,
  videoUrl,
  thumbnailUrl,
  status,
}) {
  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO videos (user_id, title, description, category, video_url, thumbnail_url, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, user_id, title, description, category, video_url, thumbnail_url, status,
               admin_feedback, approved_by, approved_at, rejection_reason,
               views_count, reactions_count, created_at, updated_at`,
    [userId, title, description, category, videoUrl, thumbnailUrl, status],
  );

  return result.rows[0];
}

async function findVideoById(videoId) {
  const pool = getPool();
  const result = await pool.query(
    `SELECT id, user_id, title, description, category, video_url, thumbnail_url, status,
            admin_feedback, approved_by, approved_at, rejection_reason,
            views_count, reactions_count, created_at, updated_at
     FROM videos
     WHERE id = $1
     LIMIT 1`,
    [videoId],
  );

  return result.rows[0] || null;
}

async function findApprovedVideoById(videoId) {
  const pool = getPool();
  const result = await pool.query(
    `SELECT v.id, v.user_id, v.title, v.description, v.category, v.video_url, v.thumbnail_url, v.status,
            v.admin_feedback, v.approved_by, v.approved_at, v.rejection_reason,
            v.views_count, v.reactions_count, v.created_at, v.updated_at,
            u.username, u.full_name, u.avatar_url
     FROM videos v
     INNER JOIN users u ON u.id = v.user_id
     WHERE v.id = $1 AND v.status = 'approved'
     LIMIT 1`,
    [videoId],
  );

  return result.rows[0] || null;
}

async function listVideosByUser(userId) {
  const pool = getPool();
  const result = await pool.query(
    `SELECT id, user_id, title, description, category, video_url, thumbnail_url, status,
            admin_feedback, approved_by, approved_at, rejection_reason,
            views_count, reactions_count, created_at, updated_at
     FROM videos
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );

  return result.rows;
}

async function listPendingVideos() {
  const pool = getPool();
  const result = await pool.query(
    `SELECT id, user_id, title, description, category, video_url, thumbnail_url, status,
            admin_feedback, approved_by, approved_at, rejection_reason,
            views_count, reactions_count, created_at, updated_at
     FROM videos
     WHERE status = 'pending'
     ORDER BY created_at ASC`,
    [],
  );

  return result.rows;
}

async function listApprovedVideos() {
  const pool = getPool();
  const result = await pool.query(
    `SELECT v.id, v.user_id, v.title, v.description, v.category, v.video_url, v.thumbnail_url, v.status,
            v.views_count, v.reactions_count, v.created_at, v.updated_at,
            u.username, u.full_name, u.avatar_url
     FROM videos v
     INNER JOIN users u ON u.id = v.user_id
     WHERE v.status = 'approved'
     ORDER BY v.approved_at DESC NULLS LAST, v.created_at DESC`,
    [],
  );

  return result.rows;
}

module.exports.emptyReactionSummary = emptyReactionSummary;
module.exports.attachReactionSummaries = attachReactionSummaries;

async function updateVideoModeration({
  db,
  videoId,
  status,
  adminId,
  feedback,
  rejectionReason,
}) {
  const executor = db || getPool();
  const result = await executor.query(
    `UPDATE videos
     SET status = $2,
         admin_feedback = $3,
         rejection_reason = $4,
         approved_by = CASE WHEN $2 = 'approved' THEN $5 ELSE approved_by END,
         approved_at = CASE WHEN $2 = 'approved' THEN NOW() ELSE approved_at END,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, user_id, title, description, category, video_url, thumbnail_url, status,
               admin_feedback, approved_by, approved_at, rejection_reason,
               views_count, reactions_count, created_at, updated_at`,
    [videoId, status, feedback, rejectionReason, adminId],
  );

  return result.rows[0] || null;
}

module.exports = {
  attachReactionSummaries,
  createVideo,
  emptyReactionSummary,
  findApprovedVideoById,
  findVideoById,
  listApprovedVideos,
  listPendingVideos,
  listVideosByUser,
  updateVideoModeration,
};
