const { asyncHandler } = require("../utils/async-handler");
const { getAuditLogs } = require("../services/audit-service");

const listAuditLogs = asyncHandler(async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const logs = await getAuditLogs({
    limit: Number.isInteger(limit) && limit > 0 && limit <= 200 ? limit : 50,
  });

  res.json({ logs });
});

module.exports = {
  listAuditLogs,
};
