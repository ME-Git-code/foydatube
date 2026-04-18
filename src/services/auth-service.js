const bcrypt = require("bcryptjs");

const { getGoogleClient } = require("../config/google");
const { ROLES } = require("../constants/roles");
const {
  createGoogleUser,
  createUser,
  findUserByEmail,
  findUserByGoogleId,
  findUserById,
  findUserByUsername,
  linkGoogleAccount,
  updateUserPassword,
  updateUserEmailVerified,
} = require("../repositories/users-repository");
const {
  createPasswordResetToken,
  findActivePasswordResetToken,
  markPasswordResetTokenUsed,
} = require("../repositories/password-reset-repository");
const {
  createEmailVerificationToken,
  findActiveVerificationToken,
  markVerificationTokenUsed,
} = require("../repositories/verification-repository");
const { createHttpError } = require("../utils/http-error");
const { signAccessToken } = require("../utils/jwt");
const { generatePlainToken, hashToken } = require("../utils/tokens");

function toAuthResponse(user) {
  return {
    token: signAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    }),
    user,
  };
}

async function registerUser(input) {
  const existingEmail = await findUserByEmail(input.email);
  if (existingEmail) {
    throw createHttpError(409, "Email already exists");
  }

  const existingUsername = await findUserByUsername(input.username);
  if (existingUsername) {
    throw createHttpError(409, "Username already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await createUser({
    fullName: input.fullName,
    username: input.username,
    email: input.email,
    passwordHash,
    role: ROLES.USER,
  });

  const verification = await issueEmailVerification(user.id);

  return {
    ...toAuthResponse(user),
    verification,
  };
}

async function loginUser(input) {
  const user = await findUserByEmail(input.email);

  if (!user || !user.password_hash) {
    throw createHttpError(401, "Invalid email or password");
  }

  if (!user.is_email_verified) {
    throw createHttpError(403, "Please verify your email before logging in");
  }

  const isMatch = await bcrypt.compare(input.password, user.password_hash);
  if (!isMatch) {
    throw createHttpError(401, "Invalid email or password");
  }

  const safeUser = await findUserById(user.id);
  return toAuthResponse(safeUser);
}

async function getCurrentUser(userId) {
  const user = await findUserById(userId);

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  return user;
}

async function issueEmailVerification(userId) {
  const user = await findUserById(userId);

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  if (user.is_email_verified) {
    return {
      alreadyVerified: true,
    };
  }

  const plainToken = generatePlainToken();
  const tokenHash = hashToken(plainToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  await createEmailVerificationToken({
    userId,
    tokenHash,
    expiresAt,
  });

  const baseUrl =
    process.env.EMAIL_VERIFICATION_BASE_URL ||
    `${process.env.CLIENT_URL || "http://localhost:3000"}/verify-email`;

  return {
    alreadyVerified: false,
    verificationLink: `${baseUrl}?token=${plainToken}`,
    expiresAt: expiresAt.toISOString(),
  };
}

async function issueEmailVerificationByEmail(email) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  return issueEmailVerification(user.id);
}

async function verifyEmailToken(token) {
  const tokenHash = hashToken(token);
  const verification = await findActiveVerificationToken(tokenHash);

  if (!verification) {
    throw createHttpError(400, "Verification token is invalid or expired");
  }

  await markVerificationTokenUsed(verification.id);
  const user = await updateUserEmailVerified(verification.user_id);

  return { user };
}

function slugifyUsernamePart(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 20);
}

async function generateUniqueUsername(seed) {
  const base = slugifyUsernamePart(seed) || `user${Date.now().toString().slice(-6)}`;
  let candidate = base.slice(0, 20);
  let suffix = 1;

  while (await findUserByUsername(candidate)) {
    const suffixText = String(suffix);
    candidate = `${base.slice(0, Math.max(1, 20 - suffixText.length))}${suffixText}`;
    suffix += 1;
  }

  return candidate;
}

async function loginWithGoogle({ idToken }) {
  const googleClient = getGoogleClient();
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.sub || !payload.email) {
    throw createHttpError(400, "Invalid Google account data");
  }

  const googleId = payload.sub;
  const email = String(payload.email).toLowerCase();
  const fullName = payload.name || payload.given_name || "Google User";
  const avatarUrl = payload.picture || null;

  const existingByGoogleId = await findUserByGoogleId(googleId);
  if (existingByGoogleId) {
    const safeUser = await findUserById(existingByGoogleId.id);
    return toAuthResponse(safeUser);
  }

  const existingByEmail = await findUserByEmail(email);
  if (existingByEmail) {
    const linked = await linkGoogleAccount({
      userId: existingByEmail.id,
      googleId,
      avatarUrl,
    });

    return toAuthResponse(linked);
  }

  const username = await generateUniqueUsername(email.split("@")[0] || fullName);
  const user = await createGoogleUser({
    fullName,
    username,
    email,
    googleId,
    avatarUrl,
    role: ROLES.USER,
  });

  return toAuthResponse(user);
}

async function issuePasswordResetByEmail(email) {
  const user = await findUserByEmail(email);

  if (!user) {
    return { sent: true };
  }

  const plainToken = generatePlainToken();
  const tokenHash = hashToken(plainToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

  await createPasswordResetToken({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  const baseUrl =
    process.env.PASSWORD_RESET_BASE_URL ||
    `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password`;

  return {
    sent: true,
    resetLink: `${baseUrl}?token=${plainToken}`,
    expiresAt: expiresAt.toISOString(),
  };
}

async function resetPasswordWithToken({ token, password }) {
  const tokenHash = hashToken(token);
  const resetToken = await findActivePasswordResetToken(tokenHash);

  if (!resetToken) {
    throw createHttpError(400, "Reset token is invalid or expired");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await markPasswordResetTokenUsed(resetToken.id);
  const user = await updateUserPassword({
    userId: resetToken.user_id,
    passwordHash,
  });

  return { user };
}

module.exports = {
  getCurrentUser,
  issueEmailVerification,
  issueEmailVerificationByEmail,
  issuePasswordResetByEmail,
  loginUser,
  loginWithGoogle,
  registerUser,
  resetPasswordWithToken,
  verifyEmailToken,
};
