const { asyncHandler } = require("../utils/async-handler");
const { VIDEO_STATUS } = require("../constants/video-status");
const { validatePositiveId } = require("../validators/common");
const {
  getApprovedVideoDetail,
  getApprovedVideos,
  getMyVideos,
  getPendingVideos,
  moderateVideo,
  uploadVideo,
} = require("../services/videos-service");
const {
  validateModerationInput,
  validateVideoCreateInput,
} = require("../validators/videos");

const createVideo = asyncHandler(async (req, res) => {
  const payload = validateVideoCreateInput(req.body);
  const video = await uploadVideo(req.auth.sub, payload);

  res.status(201).json({
    message: "Video yuklandi, admin javobini kuting",
    video,
  });
});

const myVideos = asyncHandler(async (req, res) => {
  const videos = await getMyVideos(req.auth.sub);
  res.json({ videos });
});

const publicVideos = asyncHandler(async (_req, res) => {
  const videos = await getApprovedVideos();
  res.json({ videos });
});

const publicVideoDetail = asyncHandler(async (req, res) => {
  const videoId = validatePositiveId(req.params.videoId, "video id");
  const video = await getApprovedVideoDetail(videoId);
  res.json({ video });
});

const pendingVideos = asyncHandler(async (_req, res) => {
  const videos = await getPendingVideos();
  res.json({ videos });
});

const approveVideo = asyncHandler(async (req, res) => {
  const payload = validateModerationInput(req.body);
  const result = await moderateVideo({
    videoId: validatePositiveId(req.params.videoId, "video id"),
    adminId: req.auth.sub,
    adminRole: req.auth.role,
    status: VIDEO_STATUS.APPROVED,
    feedback: payload.feedback,
    rejectionReason: null,
    points: payload.points,
  });

  res.json(result);
});

const rejectVideo = asyncHandler(async (req, res) => {
  const payload = validateModerationInput(req.body);
  const result = await moderateVideo({
    videoId: validatePositiveId(req.params.videoId, "video id"),
    adminId: req.auth.sub,
    adminRole: req.auth.role,
    status: VIDEO_STATUS.REJECTED,
    feedback: payload.feedback,
    rejectionReason: payload.rejectionReason || "Rejected by admin",
    points: null,
  });

  res.json(result);
});

module.exports = {
  approveVideo,
  createVideo,
  publicVideoDetail,
  publicVideos,
  myVideos,
  pendingVideos,
  rejectVideo,
};
