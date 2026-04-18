const { createHttpError } = require("../utils/http-error");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validateRegisterInput(payload) {
  const fullName = String(payload.fullName || "").trim();
  const username = String(payload.username || "").trim().toLowerCase();
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || "");

  if (!fullName || fullName.length < 2) {
    throw createHttpError(400, "Full name must be at least 2 characters");
  }

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    throw createHttpError(
      400,
      "Username must be 3-20 chars and contain only lowercase letters, numbers, or underscore",
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createHttpError(400, "Valid email is required");
  }

  if (password.length < 8) {
    throw createHttpError(400, "Password must be at least 8 characters");
  }

  return {
    fullName,
    username,
    email,
    password,
  };
}

function validateLoginInput(payload) {
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || "");

  if (!email) {
    throw createHttpError(400, "Email is required");
  }

  if (!password) {
    throw createHttpError(400, "Password is required");
  }

  return {
    email,
    password,
  };
}

function validateGoogleLoginInput(payload) {
  const idToken = String(payload.idToken || "").trim();

  if (!idToken) {
    throw createHttpError(400, "Google idToken is required");
  }

  return { idToken };
}

function validateEmailVerificationInput(payload) {
  const email = normalizeEmail(payload.email);

  if (!email) {
    throw createHttpError(400, "Email is required");
  }

  return { email };
}

function validateVerificationTokenInput(payload) {
  const token = String(payload.token || "").trim();

  if (!token) {
    throw createHttpError(400, "Verification token is required");
  }

  return { token };
}

function validatePasswordResetConfirmInput(payload) {
  const token = String(payload.token || "").trim();
  const password = String(payload.password || "");

  if (!token) {
    throw createHttpError(400, "Reset token is required");
  }

  if (password.length < 8) {
    throw createHttpError(400, "Password must be at least 8 characters");
  }

  return {
    token,
    password,
  };
}

module.exports = {
  validateEmailVerificationInput,
  validateGoogleLoginInput,
  normalizeEmail,
  validateLoginInput,
  validatePasswordResetConfirmInput,
  validateRegisterInput,
  validateVerificationTokenInput,
};
