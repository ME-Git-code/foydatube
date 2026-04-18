const { getPool } = require("../config/db");

async function createAuditLog({
  actorUserId,
  actorRole,
  action,
  targetType,
  targetId,
  details,
}) {
  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO audit_logs (actor_user_id, actor_role, action, target_type, target_id, details)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)
     RETURNING id, actor_user_id, actor_role, action, target_type, target_id, details, created_at`,
    [
      actorUserId ?? null,
      actorRole ?? null,
      action,
      targetType,
      targetId ?? null,
      JSON.stringify(details || {}),
    ],
  );

  return result.rows[0];
}

async function listAuditLogs({ limit = 50 } = {}) {
  const pool = getPool();
  const result = await pool.query(
    `SELECT id, actor_user_id, actor_role, action, target_type, target_id, details, created_at
     FROM audit_logs
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit],
  );

  return result.rows;
}

module.exports = {
  createAuditLog,
  listAuditLogs,
};
