const express = require("express");

const {
  listAdmins,
  makeAdmin,
  updatePermissions,
} = require("../controllers/admin-controller");
const { ROLES } = require("../constants/roles");
const { requireAuth, requireRole } = require("../middleware/auth");

const adminRouter = express.Router();

adminRouter.use(requireAuth, requireRole(ROLES.BOSS));
adminRouter.get("/admins", listAdmins);
adminRouter.post("/admins/:userId", makeAdmin);
adminRouter.patch("/admins/:userId/permissions", updatePermissions);

module.exports = { adminRouter };
