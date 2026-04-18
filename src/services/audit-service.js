const { createAuditLog, listAuditLogs } = require("../repositories/audit-repository");

async function logAuditEvent(event) {
  return createAuditLog(event);
}

async function getAuditLogs(options) {
  return listAuditLogs(options);
}

module.exports = {
  getAuditLogs,
  logAuditEvent,
};
