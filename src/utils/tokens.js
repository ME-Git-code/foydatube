const crypto = require("crypto");

function generatePlainToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

module.exports = {
  generatePlainToken,
  hashToken,
};
