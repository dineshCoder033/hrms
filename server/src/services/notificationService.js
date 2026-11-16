const Notification = require('../models/Notification');
const User = require('../models/User');

const notifyUser = async ({ userId, title, message, type = 'system', link = '/' }) => {
  try {
    if (!userId) return null;
    return await Notification.create({ userId, title, message, type, link });
  } catch (err) {
    console.error('[Notification] Failed to create notification:', err.message);
    return null;
  }
};

const notifyByEmployeeId = async ({ employeeId, title, message, type = 'system', link = '/' }) => {
  try {
    if (!employeeId) return null;
    const user = await User.findOne({ employeeId, isActive: true }).select('_id').lean();
    if (!user) return null;
    return await notifyUser({ userId: user._id, title, message, type, link });
  } catch (err) {
    console.error('[Notification] Failed to notify employee:', err.message);
    return null;
  }
};

const getUserNotifications = async (userId, { limit = 20 } = {}) => {
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 20));
  const [items, unreadCount] = await Promise.all([
    Notification.find({ userId }).sort({ createdAt: -1 }).limit(safeLimit).lean(),
    Notification.countDocuments({ userId, isRead: false })
  ]);
  return { items, unreadCount };
};

const markAsRead = async (id, userId) => {
  return Notification.findOneAndUpdate(
    { _id: id, userId },
    { isRead: true },
    { returnDocument: 'after' }
  );
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  return { success: true };
};

module.exports = {
  notifyUser,
  notifyByEmployeeId,
  getUserNotifications,
  markAsRead,
  markAllAsRead
};

