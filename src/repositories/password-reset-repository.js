const { getPool } = require("../config/db");

async function createPasswordResetToken({ userId, tokenHash, expiresAt }) {
  const pool = getPool();

  await pool.query(
    `UPDATE password_reset_tokens
     SET used_at = NOW()
     WHERE user_id = $1 AND used_at IS NULL`,
    [userId],
  );

  const result = await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, token_hash, expires_at, used_at, created_at`,
    [userId, tokenHash, expiresAt],
  );

  return result.rows[0];
}

async function findActivePasswordResetToken(tokenHash) {
  const pool = getPool();
  const result = await pool.query(
    `SELECT id, user_id, token_hash, expires_at, used_at, created_at
     FROM password_reset_tokens
     WHERE token_hash = $1
       AND used_at IS NULL
       AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash],
  );

  return result.rows[0] || null;
}

async function markPasswordResetTokenUsed(id) {
  const pool = getPool();
  await pool.query(
    `UPDATE password_reset_tokens
     SET used_at = NOW()
     WHERE id = $1`,
    [id],
  );
}

module.exports = {
  createPasswordResetToken,
  findActivePasswordResetToken,
  markPasswordResetTokenUsed,
};
