const { getPool } = require("../config/db");

async function findUserByEmail(email) {
  const pool = getPool();
  const result = await pool.query(
    `SELECT id, full_name, username, email, password_hash, google_id, avatar_url, role, points,
            is_email_verified, created_at, updated_at
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email],
  );

  return result.rows[0] || null;
}

async function findUserByGoogleId(googleId) {
  const pool = getPool();
  const result = await pool.query(
    `SELECT id, full_name, username, email, password_hash, google_id, avatar_url, role, points,
            is_email_verified, created_at, updated_at
     FROM users
     WHERE google_id = $1
     LIMIT 1`,
    [googleId],
  );

  return result.rows[0] || null;
}

async function findUserByUsername(username) {
  const pool = getPool();
  const result = await pool.query(
    `SELECT id, username
     FROM users
     WHERE username = $1
     LIMIT 1`,
    [username],
  );

  return result.rows[0] || null;
}

async function findUserById(id) {
  const pool = getPool();
  const result = await pool.query(
    `SELECT id, full_name, username, email, google_id, avatar_url, role, points,
            is_email_verified, created_at, updated_at
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [id],
  );

  return result.rows[0] || null;
}

async function createUser({ fullName, username, email, passwordHash, role }) {
  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO users (full_name, username, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, full_name, username, email, google_id, avatar_url, role, points,
               is_email_verified, created_at, updated_at`,
    [fullName, username, email, passwordHash, role],
  );

  return result.rows[0];
}

async function createGoogleUser({
  fullName,
  username,
  email,
  googleId,
  avatarUrl,
  role,
}) {
  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO users (full_name, username, email, google_id, avatar_url, role, is_email_verified)
     VALUES ($1, $2, $3, $4, $5, $6, TRUE)
     RETURNING id, full_name, username, email, google_id, avatar_url, role, points,
               is_email_verified, created_at, updated_at`,
    [fullName, username, email, googleId, avatarUrl, role],
  );

  return result.rows[0];
}

async function updateUserEmailVerified(userId) {
  const pool = getPool();
  const result = await pool.query(
    `UPDATE users
     SET is_email_verified = TRUE,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, full_name, username, email, google_id, avatar_url, role, points,
               is_email_verified, created_at, updated_at`,
    [userId],
  );

  return result.rows[0] || null;
}

async function linkGoogleAccount({ userId, googleId, avatarUrl }) {
  const pool = getPool();
  const result = await pool.query(
    `UPDATE users
     SET google_id = $2,
         avatar_url = COALESCE($3, avatar_url),
         is_email_verified = TRUE,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, full_name, username, email, google_id, avatar_url, role, points,
               is_email_verified, created_at, updated_at`,
    [userId, googleId, avatarUrl],
  );

  return result.rows[0] || null;
}

async function updateUserPassword({ userId, passwordHash }) {
  const pool = getPool();
  const result = await pool.query(
    `UPDATE users
     SET password_hash = $2,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, full_name, username, email, google_id, avatar_url, role, points,
               is_email_verified, created_at, updated_at`,
    [userId, passwordHash],
  );

  return result.rows[0] || null;
}

module.exports = {
  createUser,
  createGoogleUser,
  findUserByEmail,
  findUserByGoogleId,
  findUserById,
  findUserByUsername,
  linkGoogleAccount,
  updateUserPassword,
  updateUserEmailVerified,
};
