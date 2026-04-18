const rateLimit = require("express-rate-limit");

const { getRateLimitConfig } = require("../config/rate-limit");

function buildLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message,
    },
  });
}

function createGeneralLimiter() {
  const config = getRateLimitConfig();

  return buildLimiter({
    windowMs: config.generalWindowMs,
    max: config.generalMax,
    message: "Too many requests, please try again later",
  });
}

function createAuthLimiter() {
  const config = getRateLimitConfig();

  return buildLimiter({
    windowMs: config.authWindowMs,
    max: config.authMax,
    message: "Too many authentication attempts, please try again later",
  });
}

module.exports = {
  createAuthLimiter,
  createGeneralLimiter,
};
