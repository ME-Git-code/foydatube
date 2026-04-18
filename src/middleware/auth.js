const { findUserById } = require("../repositories/users-repository");
const { verifyAccessToken } = require("../utils/jwt");
const { createHttpError } = require("../utils/http-error");

function extractBearerToken(headerValue) {
  if (!headerValue) {
    return null;
  }

  const [scheme, token] = String(headerValue).split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

function requireAuth(req, _res, next) {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return next(createHttpError(401, "Authentication required"));
  }

  try {
    req.auth = verifyAccessToken(token);
    return next();
  } catch (_error) {
    return next(createHttpError(401, "Invalid or expired token"));
  }
}

function requireRole(...allowedRoles) {
  return function roleGuard(req, _res, next) {
    if (!req.auth) {
      return next(createHttpError(401, "Authentication required"));
    }

    if (!allowedRoles.includes(req.auth.role)) {
      return next(createHttpError(403, "You do not have access to this resource"));
    }

    return next();
  };
}

async function requireVerifiedEmail(req, _res, next) {
  if (!req.auth) {
    return next(createHttpError(401, "Authentication required"));
  }

  try {
    const user = await findUserById(req.auth.sub);

    if (!user) {
      return next(createHttpError(401, "Authentication required"));
    }

    if (!user.is_email_verified) {
      return next(createHttpError(403, "Email verification is required"));
    }

    req.currentUser = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  requireAuth,
  requireRole,
  requireVerifiedEmail,
};
