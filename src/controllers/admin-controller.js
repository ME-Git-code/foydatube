const { asyncHandler } = require("../utils/async-handler");
const {
  assignAdmin,
  getAdminList,
  updateAdminAccess,
} = require("../services/admin-service");
const {
  validateAdminPermissionInput,
  validateAdminTargetId,
} = require("../validators/admin");

const listAdmins = asyncHandler(async (_req, res) => {
  const admins = await getAdminList();
  res.json({ admins });
});

const makeAdmin = asyncHandler(async (req, res) => {
  const userId = validateAdminTargetId(req.params.userId);
  const permissions = validateAdminPermissionInput(req.body);
  const result = await assignAdmin({
    userId,
    grantedBy: req.auth.sub,
    permissions,
  });

  res.json(result);
});

const updatePermissions = asyncHandler(async (req, res) => {
  const userId = validateAdminTargetId(req.params.userId);
  const permissions = validateAdminPermissionInput(req.body);
  const result = await updateAdminAccess({
    userId,
    grantedBy: req.auth.sub,
    permissions,
  });

  res.json(result);
});

module.exports = {
  listAdmins,
  makeAdmin,
  updatePermissions,
};
