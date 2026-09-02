import prisma from '../config/database.js';

export const createAuditLog = async ({
  adminId,
  action,
  targetType,
  targetId,
  details = null,
  req = null,
}) => {
  try {
    const ipAddress = req ? (req.ip || req.connection?.remoteAddress || null) : null;
    const userAgent = req ? (req.get('user-agent') || null) : null;

    await prisma.auditLog.create({
      data: {
        adminId,
        action,
        targetType,
        targetId,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error('Audit log failed:', error);
  }
};

export const getAuditLogs = async (filters = {}) => {
  const { adminId, action, targetType, targetId, limit = 100, offset = 0 } = filters;

  const where = {};
  if (adminId) where.adminId = parseInt(adminId);
  if (action) where.action = action;
  if (targetType) where.targetType = targetType;
  if (targetId) where.targetId = parseInt(targetId);

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        admin: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total };
};

export default { createAuditLog, getAuditLogs };
