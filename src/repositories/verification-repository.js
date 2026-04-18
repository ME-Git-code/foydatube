const { getPool } = require("../config/db");

async function createEmailVerificationToken({ userId, tokenHash, expiresAt }) {
  const pool = getPool();

  await pool.query(
    `UPDATE email_verification_tokens
     SET used_at = NOW()
     WHERE user_id = $1 AND used_at IS NULL`,
    [userId],
  );

  const result = await pool.query(
    `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, token_hash, expires_at, used_at, created_at`,
    [userId, tokenHash, expiresAt],
  );

  return result.rows[0];
}

async function findActiveVerificationToken(tokenHash) {
  const pool = getPool();
  const result = await pool.query(
    `SELECT id, user_id, token_hash, expires_at, used_at, created_at
     FROM email_verification_tokens
     WHERE token_hash = $1
       AND used_at IS NULL
       AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash],
  );

  return result.rows[0] || null;
}

async function markVerificationTokenUsed(id) {
  const pool = getPool();
  await pool.query(
    `UPDATE email_verification_tokens
     SET used_at = NOW()
     WHERE id = $1`,
    [id],
  );
}

module.exports = {
  createEmailVerificationToken,
  findActiveVerificationToken,
  markVerificationTokenUsed,
};
