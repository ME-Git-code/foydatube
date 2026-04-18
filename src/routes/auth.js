const express = require("express");

const {
  confirmPasswordReset,
  googleLogin,
  login,
  me,
  requestPasswordReset,
  requestEmailVerification,
  register,
  verifyEmail,
} = require("../controllers/auth-controller");
const { requireAuth } = require("../middleware/auth");
const { createAuthLimiter } = require("../middleware/rate-limit");

const authRouter = express.Router();
const authLimiter = createAuthLimiter();

authRouter.post("/register", authLimiter, register);
authRouter.post("/login", authLimiter, login);
authRouter.post("/google", authLimiter, googleLogin);
authRouter.post("/verify-email/request", authLimiter, requestEmailVerification);
authRouter.post("/verify-email/confirm", authLimiter, verifyEmail);
authRouter.post("/password-reset/request", authLimiter, requestPasswordReset);
authRouter.post("/password-reset/confirm", authLimiter, confirmPasswordReset);
authRouter.get("/me", requireAuth, me);

module.exports = { authRouter };
