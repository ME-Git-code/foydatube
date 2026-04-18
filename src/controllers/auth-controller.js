const { asyncHandler } = require("../utils/async-handler");
const {
  getCurrentUser,
  issueEmailVerificationByEmail,
  issuePasswordResetByEmail,
  loginUser,
  loginWithGoogle,
  registerUser,
  resetPasswordWithToken,
  verifyEmailToken,
} = require("../services/auth-service");
const {
  validateEmailVerificationInput,
  validateGoogleLoginInput,
  validateLoginInput,
  validatePasswordResetConfirmInput,
  validateRegisterInput,
  validateVerificationTokenInput,
} = require("../validators/auth");

const register = asyncHandler(async (req, res) => {
  const payload = validateRegisterInput(req.body);
  const result = await registerUser(payload);

  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const payload = validateLoginInput(req.body);
  const result = await loginUser(payload);

  res.json(result);
});

const me = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.auth.sub);

  res.json({ user });
});

const googleLogin = asyncHandler(async (req, res) => {
  const payload = validateGoogleLoginInput(req.body);
  const result = await loginWithGoogle(payload);

  res.json(result);
});

const requestEmailVerification = asyncHandler(async (req, res) => {
  const { email } = validateEmailVerificationInput(req.body);
  const result = await issueEmailVerificationByEmail(email);

  res.json(result);
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = validateVerificationTokenInput(req.body);
  const result = await verifyEmailToken(token);

  res.json(result);
});

const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = validateEmailVerificationInput(req.body);
  const result = await issuePasswordResetByEmail(email);

  res.json(result);
});

const confirmPasswordReset = asyncHandler(async (req, res) => {
  const payload = validatePasswordResetConfirmInput(req.body);
  const result = await resetPasswordWithToken(payload);

  res.json(result);
});

module.exports = {
  confirmPasswordReset,
  googleLogin,
  login,
  me,
  requestPasswordReset,
  requestEmailVerification,
  register,
  verifyEmail,
};
