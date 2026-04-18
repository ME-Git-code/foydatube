const { getPool } = require("../config/db");

async function upsertVideoReaction({ videoId, userId, reaction }) {
  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO video_reactions (video_id, user_id, reaction)
     VALUES ($1, $2, $3)
     ON CONFLICT (video_id, user_id)
     DO UPDATE SET
        reaction = EXCLUDED.reaction,
        updated_at = NOW()
     RETURNING id, video_id, user_id, reaction, created_at, updated_at`,
    [videoId, userId, reaction],
  );

  return result.rows[0];
}

async function deleteVideoReaction({ videoId, userId }) {
  const pool = getPool();
  const result = await pool.query(
    `DELETE FROM video_reactions
     WHERE video_id = $1 AND user_id = $2
     RETURNING id, video_id, user_id, reaction, created_at, updated_at`,
    [videoId, userId],
  );

  return result.rows[0] || null;
}

async function getUserReactionForVideo({ videoId, userId }) {
  const pool = getPool();
  const result = await pool.query(
    `SELECT id, video_id, user_id, reaction, created_at, updated_at
     FROM video_reactions
     WHERE video_id = $1 AND user_id = $2
     LIMIT 1`,
    [videoId, userId],
  );

  return result.rows[0] || null;
}

async function getReactionSummaryForVideo(videoId) {
  const pool = getPool();
  const result = await pool.query(
    `SELECT reaction, COUNT(*)::INT AS count
     FROM video_reactions
     WHERE video_id = $1
     GROUP BY reaction`,
    [videoId],
  );

  return result.rows;
}

async function getReactionSummaryForVideos(videoIds) {
  if (!videoIds.length) {
    return [];
  }

  const pool = getPool();
  const result = await pool.query(
    `SELECT video_id, reaction, COUNT(*)::INT AS count
     FROM video_reactions
     WHERE video_id = ANY($1::BIGINT[])
     GROUP BY video_id, reaction`,
    [videoIds],
  );

  return result.rows;
}

module.exports = {
  deleteVideoReaction,
  getReactionSummaryForVideo,
  getReactionSummaryForVideos,
  getUserReactionForVideo,
  upsertVideoReaction,
};
