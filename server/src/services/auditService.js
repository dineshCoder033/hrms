const AuditLog = require('../models/AuditLog');

/**
 * Non-throwing audit logger so compliance logging never breaks primary business flows.
 */
const logAudit = async ({ user, action, entityType, entityId, details, ip }) => {
  try {
    await AuditLog.create({
      actorId: user?.id || user?._id || undefined,
      actorName: user?.name || 'System',
      actorRole: user?.role || 'System',
      action,
      entityType,
      entityId: entityId ? String(entityId) : undefined,
      details,
      ip
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit entry:', err.message);
  }
};

const getAuditLogs = async ({ page = 1, limit = 25, entityType, action } = {}) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 25));
  const filter = {};
  if (entityType) filter.entityType = entityType;
  if (action) filter.action = new RegExp(action, 'i');

  const [items, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),
    AuditLog.countDocuments(filter)
  ]);

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit)
    }
  };
};

module.exports = { logAudit, getAuditLogs };

