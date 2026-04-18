const { getPool } = require("../config/db");

async function listAdminsWithPermissions() {
  const pool = getPool();
  const result = await pool.query(
    `SELECT u.id, u.full_name, u.username, u.email, u.role, u.points,
            ap.can_review_videos, ap.can_manage_comments, ap.can_award_points, ap.can_manage_ads,
            ap.granted_by, ap.created_at AS permissions_created_at, ap.updated_at AS permissions_updated_at
     FROM users u
     LEFT JOIN admin_permissions ap ON ap.admin_id = u.id
     WHERE u.role IN ('admin', 'boss')
     ORDER BY u.role DESC, u.created_at ASC`,
    [],
  );

  return result.rows;
}

async function updateUserRole({ userId, role }) {
  const pool = getPool();
  const result = await pool.query(
    `UPDATE users
     SET role = $2,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, full_name, username, email, google_id, avatar_url, role, points,
               is_email_verified, created_at, updated_at`,
    [userId, role],
  );

  return result.rows[0] || null;
}

async function upsertAdminPermissions({
  adminId,
  grantedBy,
  canReviewVideos,
  canManageComments,
  canAwardPoints,
  canManageAds,
}) {
  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO admin_permissions (
        admin_id, granted_by, can_review_videos, can_manage_comments, can_award_points, can_manage_ads
     )
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (admin_id)
     DO UPDATE SET
        granted_by = EXCLUDED.granted_by,
        can_review_videos = EXCLUDED.can_review_videos,
        can_manage_comments = EXCLUDED.can_manage_comments,
        can_award_points = EXCLUDED.can_award_points,
        can_manage_ads = EXCLUDED.can_manage_ads,
        updated_at = NOW()
     RETURNING id, admin_id, granted_by, can_review_videos, can_manage_comments,
               can_award_points, can_manage_ads, created_at, updated_at`,
    [adminId, grantedBy, canReviewVideos, canManageComments, canAwardPoints, canManageAds],
  );

  return result.rows[0];
}

module.exports = {
  listAdminsWithPermissions,
  updateUserRole,
  upsertAdminPermissions,
};
