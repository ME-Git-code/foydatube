function getRateLimitConfig() {
  return {
    generalWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    generalMax: Number(process.env.RATE_LIMIT_MAX || 300),
    authWindowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    authMax: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
  };
}

module.exports = {
  getRateLimitConfig,
};
