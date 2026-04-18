const { ROLES } = require("../constants/roles");
const { findUserById } = require("../repositories/users-repository");
const { logAuditEvent } = require("./audit-service");
const {
  listAdminsWithPermissions,
  updateUserRole,
  upsertAdminPermissions,
} = require("../repositories/admin-repository");
const { createHttpError } = require("../utils/http-error");

async function getAdminList() {
  return listAdminsWithPermissions();
}

async function getAdminAccess(userId) {
  const admins = await listAdminsWithPermissions();
  return admins.find((admin) => admin.id === userId) || null;
}

async function assignAdmin({ userId, grantedBy, permissions }) {
  const user = await findUserById(userId);

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  const updatedUser = await updateUserRole({
    userId,
    role: ROLES.ADMIN,
  });

  const permissionRecord = await upsertAdminPermissions({
    adminId: userId,
    grantedBy,
    ...permissions,
  });

  await logAuditEvent({
    actorUserId: grantedBy,
    actorRole: ROLES.BOSS,
    action: "admin.assign",
    targetType: "user",
    targetId: userId,
    details: {
      assignedRole: ROLES.ADMIN,
      permissions,
    },
  });

  return {
    user: updatedUser,
    permissions: permissionRecord,
  };
}

async function updateAdminAccess({ userId, grantedBy, permissions }) {
  const user = await findUserById(userId);

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  if (user.role !== ROLES.ADMIN && user.role !== ROLES.BOSS) {
    throw createHttpError(400, "Target user is not an admin");
  }

  const permissionRecord = await upsertAdminPermissions({
    adminId: userId,
    grantedBy,
    ...permissions,
  });

  await logAuditEvent({
    actorUserId: grantedBy,
    actorRole: ROLES.BOSS,
    action: "admin.permissions.update",
    targetType: "user",
    targetId: userId,
    details: {
      permissions,
    },
  });

  return {
    user,
    permissions: permissionRecord,
  };
}

module.exports = {
  assignAdmin,
  getAdminAccess,
  getAdminList,
  updateAdminAccess,
};
