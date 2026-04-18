const { getPool } = require("../config/db");
const { VIDEO_STATUS } = require("../constants/video-status");
const { ROLES } = require("../constants/roles");
const { getReactionSummaryForVideo, getReactionSummaryForVideos } = require("../repositories/reactions-repository");
const { logAuditEvent } = require("./audit-service");
const { getAdminAccess } = require("./admin-service");
const {
  attachReactionSummaries,
  createVideo,
  emptyReactionSummary,
  findApprovedVideoById,
  findVideoById,
  listApprovedVideos,
  listPendingVideos,
  listVideosByUser,
  updateVideoModeration,
} = require("../repositories/videos-repository");
const { createHttpError } = require("../utils/http-error");

async function uploadVideo(userId, input) {
  return createVideo({
    userId,
    title: input.title,
    description: input.description,
    category: input.category,
    videoUrl: input.videoUrl,
    thumbnailUrl: input.thumbnailUrl,
    status: VIDEO_STATUS.PENDING,
  });
}

async function getMyVideos(userId) {
  return listVideosByUser(userId);
}

async function getPendingVideos() {
  return listPendingVideos();
}

async function getApprovedVideos() {
  const videos = await listApprovedVideos();
  const summaryRows = await getReactionSummaryForVideos(videos.map((video) => video.id));
  return attachReactionSummaries(videos, summaryRows);
}

async function getApprovedVideoDetail(videoId) {
  const video = await findApprovedVideoById(videoId);

  if (!video) {
    throw createHttpError(404, "Approved video not found");
  }

  const summaryRows = await getReactionSummaryForVideo(videoId);
  const summary = emptyReactionSummary();

  for (const row of summaryRows) {
    summary[row.reaction] = row.count;
    summary.total += row.count;
  }

  return {
    ...video,
    reaction_summary: summary,
  };
}

async function moderateVideo({ videoId, adminId, adminRole, status, feedback, rejectionReason, points }) {
  if (![ROLES.ADMIN, ROLES.BOSS].includes(adminRole)) {
    throw createHttpError(403, "Only admin or boss can moderate videos");
  }

  if (adminRole === ROLES.ADMIN) {
    const access = await getAdminAccess(adminId);

    if (!access || !access.can_review_videos) {
      throw createHttpError(403, "Admin does not have video review permission");
    }

    if (points && !access.can_award_points) {
      throw createHttpError(403, "Admin does not have point award permission");
    }
  }

  const video = await findVideoById(videoId);
  if (!video) {
    throw createHttpError(404, "Video not found");
  }

  if (video.status !== VIDEO_STATUS.PENDING) {
    throw createHttpError(400, "Only pending videos can be moderated");
  }

  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const updated = await updateVideoModeration({
      db: client,
      videoId,
      status,
      adminId,
      feedback,
      rejectionReason,
    });

    let award = null;
    let updatedUser = null;

    if (status === VIDEO_STATUS.APPROVED && points) {
      const awardResult = await client.query(
        `INSERT INTO point_awards (user_id, video_id, admin_id, points, reason)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id, video_id, admin_id, points, reason, created_at`,
        [video.user_id, videoId, adminId, points, feedback || "Approved video"],
      );
      award = awardResult.rows[0];

      const userResult = await client.query(
        `UPDATE users
         SET points = points + $2,
             updated_at = NOW()
         WHERE id = $1
         RETURNING id, full_name, username, email, google_id, avatar_url, role, points,
                   is_email_verified, created_at, updated_at`,
        [video.user_id, points],
      );
      updatedUser = userResult.rows[0] || null;
    }

    await client.query("COMMIT");

    await logAuditEvent({
      actorUserId: adminId,
      actorRole: adminRole,
      action: status === VIDEO_STATUS.APPROVED ? "video.approve" : "video.reject",
      targetType: "video",
      targetId: videoId,
      details: {
        ownerUserId: video.user_id,
        pointsAwarded: points || 0,
        feedback: feedback || null,
        rejectionReason: rejectionReason || null,
      },
    });

    return {
      video: updated,
      award,
      user: updatedUser,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  getApprovedVideoDetail,
  getApprovedVideos,
  getMyVideos,
  getPendingVideos,
  moderateVideo,
  uploadVideo,
};
