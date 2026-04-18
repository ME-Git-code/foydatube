const { getPool } = require("../config/db");

async function createComment({ videoId, userId, body }) {
  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO comments (video_id, user_id, body)
     VALUES ($1, $2, $3)
     RETURNING id, video_id, user_id, body, is_hidden, created_at, updated_at`,
    [videoId, userId, body],
  );

  return result.rows[0];
}

async function listVisibleCommentsByVideo(videoId) {
  const pool = getPool();
  const result = await pool.query(
    `SELECT c.id, c.video_id, c.user_id, c.body, c.is_hidden, c.created_at, c.updated_at,
            u.username, u.full_name, u.avatar_url
     FROM comments c
     INNER JOIN users u ON u.id = c.user_id
     WHERE c.video_id = $1 AND c.is_hidden = FALSE
     ORDER BY c.created_at ASC`,
    [videoId],
  );

  return result.rows;
}

module.exports = {
  createComment,
  listVisibleCommentsByVideo,
};
