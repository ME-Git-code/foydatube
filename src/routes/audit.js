const express = require("express");

const { listAuditLogs } = require("../controllers/audit-controller");
const { ROLES } = require("../constants/roles");
const { requireAuth, requireRole } = require("../middleware/auth");

const auditRouter = express.Router();

auditRouter.use(requireAuth, requireRole(ROLES.BOSS));
auditRouter.get("/", listAuditLogs);

module.exports = { auditRouter };
