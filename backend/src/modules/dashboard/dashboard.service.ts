import mongoose from 'mongoose';
import User from '@features/users/user.model';
import Role from '@features/rbac/role.model';
import Complaint from '@features/complaints/complaint.model';

export interface DashboardUserContext {
  userId: string;
  societyId: string;
  roles: string[];
}

/**
 * Builds match filter for MongoDB queries based on user role and scope.
 */
export const buildDashboardFilter = (
  user: DashboardUserContext,
  querySocietyId?: string
): Record<string, any> => {
  if (user.roles.includes('Super Admin')) {
    if (querySocietyId && mongoose.Types.ObjectId.isValid(querySocietyId)) {
      return { societyId: new mongoose.Types.ObjectId(querySocietyId) };
    }
    return {};
  }
  if (user.roles.includes('Society Admin')) {
    return { societyId: new mongoose.Types.ObjectId(user.societyId) };
  }
  if (user.roles.includes('Vendor')) {
    return { assignedTo: new mongoose.Types.ObjectId(user.userId) };
  }
  // Default to Resident
  return { createdBy: new mongoose.Types.ObjectId(user.userId) };
};

export const dashboardService = {
  /**
   * Fetch overview metrics based on user role
   */
  getOverview: async (
    user: DashboardUserContext,
    querySocietyId?: string
  ): Promise<Record<string, any>> => {
    if (user.roles.includes('Super Admin')) {
      return dashboardService.getSuperAdminOverview(querySocietyId);
    }
    if (user.roles.includes('Society Admin')) {
      return dashboardService.getSocietyAdminOverview(user.societyId);
    }
    if (user.roles.includes('Vendor')) {
      return dashboardService.getVendorOverview(user.userId);
    }
    // Default to Resident
    return dashboardService.getResidentOverview(user.userId, user.societyId);
  },

  /**
   * Super Admin Overview
   */
  getSuperAdminOverview: async (querySocietyId?: string): Promise<Record<string, any>> => {
    const filter: Record<string, any> = {};
    if (querySocietyId && mongoose.Types.ObjectId.isValid(querySocietyId)) {
      filter.societyId = new mongoose.Types.ObjectId(querySocietyId);
    }

    // Get role IDs for Resident and Vendor
    const [residentRoles, vendorRoles] = await Promise.all([
      Role.find({ name: 'Resident' }).select('_id').lean(),
      Role.find({ name: 'Vendor' }).select('_id').lean(),
    ]);

    const residentRoleIds = residentRoles.map((r) => r._id);
    const vendorRoleIds = vendorRoles.map((r) => r._id);

    const userFilter: Record<string, any> = {};
    if (filter.societyId) {
      userFilter.societyId = filter.societyId;
    }

    const [
      totalSocieties,
      totalUsers,
      totalResidents,
      totalVendors,
      totalComplaints,
      openComplaints,
      resolvedComplaints,
      criticalComplaints,
    ] = await Promise.all([
      // Count unique societies by looking at users or roles
      User.distinct('societyId'),
      User.countDocuments(userFilter),
      User.countDocuments({ ...userFilter, roles: { $in: residentRoleIds } }),
      User.countDocuments({ ...userFilter, roles: { $in: vendorRoleIds } }),
      Complaint.countDocuments(filter),
      Complaint.countDocuments({ ...filter, status: 'Open' }),
      Complaint.countDocuments({ ...filter, status: 'Resolved' }),
      Complaint.countDocuments({ ...filter, priority: 'Critical' }),
    ]);

    return {
      totalSocieties: totalSocieties.length,
      totalUsers,
      totalResidents,
      totalVendors,
      totalComplaints,
      openComplaints,
      resolvedComplaints,
      criticalComplaints,
    };
  },

  /**
   * Society Admin Overview
   */
  getSocietyAdminOverview: async (societyId: string): Promise<Record<string, any>> => {
    const sId = new mongoose.Types.ObjectId(societyId);

    // Get the resident role for this society
    const residentRole = await Role.findOne({ name: 'Resident', societyId: sId })
      .select('_id')
      .lean();
    const residentRoleId = residentRole ? residentRole._id : null;

    const userFilter = residentRoleId
      ? { societyId: sId, roles: residentRoleId }
      : { societyId: sId, role: 'Resident' };

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalResidents,
      activeResidents,
      totalComplaints,
      openComplaints,
      resolvedComplaints,
      criticalComplaints,
      complaintsThisMonth,
      complaintsByStatusRaw,
      complaintsByCategoryRaw,
      recentComplaints,
    ] = await Promise.all([
      User.countDocuments(userFilter),
      User.countDocuments({ ...userFilter, status: 'active' }),
      Complaint.countDocuments({ societyId: sId }),
      Complaint.countDocuments({ societyId: sId, status: 'Open' }),
      Complaint.countDocuments({ societyId: sId, status: 'Resolved' }),
      Complaint.countDocuments({ societyId: sId, priority: 'Critical' }),
      Complaint.countDocuments({ societyId: sId, createdAt: { $gte: startOfMonth } }),
      Complaint.aggregate([
        { $match: { societyId: sId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Complaint.aggregate([
        { $match: { societyId: sId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      Complaint.find({ societyId: sId })
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    // Format enums for frontend-ready response
    const statusMap = complaintsByStatusRaw.reduce(
      (acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      },
      {} as Record<string, number>
    );

    const complaintsByStatus = ['Open', 'In Progress', 'Resolved', 'Closed'].map((status) => ({
      status,
      count: statusMap[status] || 0,
    }));

    const categoryMap = complaintsByCategoryRaw.reduce(
      (acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      },
      {} as Record<string, number>
    );

    const complaintsByCategory = [
      'Maintenance',
      'Plumbing',
      'Electrical',
      'Security',
      'Housekeeping',
      'Other',
    ].map((category) => ({
      category,
      count: categoryMap[category] || 0,
    }));

    return {
      totalResidents,
      activeResidents,
      totalComplaints,
      openComplaints,
      resolvedComplaints,
      criticalComplaints,
      complaintsThisMonth,
      complaintsByStatus,
      complaintsByCategory,
      recentComplaints,
    };
  },

  /**
   * Resident Overview
   */
  getResidentOverview: async (userId: string, societyId: string): Promise<Record<string, any>> => {
    const uId = new mongoose.Types.ObjectId(userId);
    const sId = new mongoose.Types.ObjectId(societyId);

    const [totalComplaintsCreated, openComplaints, resolvedComplaints, recentComplaints] =
      await Promise.all([
        Complaint.countDocuments({ createdBy: uId, societyId: sId }),
        Complaint.countDocuments({ createdBy: uId, societyId: sId, status: 'Open' }),
        Complaint.countDocuments({ createdBy: uId, societyId: sId, status: 'Resolved' }),
        Complaint.find({ createdBy: uId, societyId: sId })
          .populate('assignedTo', 'name email')
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
      ]);

    return {
      totalComplaintsCreated,
      openComplaints,
      resolvedComplaints,
      recentComplaints,
    };
  },

  /**
   * Vendor Overview
   */
  getVendorOverview: async (userId: string): Promise<Record<string, any>> => {
    const uId = new mongoose.Types.ObjectId(userId);

    const [
      assignedComplaints,
      openAssignedComplaints,
      resolvedAssignedComplaints,
      recentAssignedComplaints,
    ] = await Promise.all([
      Complaint.countDocuments({ assignedTo: uId }),
      Complaint.countDocuments({ assignedTo: uId, status: { $in: ['Open', 'In Progress'] } }),
      Complaint.countDocuments({ assignedTo: uId, status: { $in: ['Resolved', 'Closed'] } }),
      Complaint.find({ assignedTo: uId })
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    return {
      assignedComplaints,
      openAssignedComplaints,
      resolvedAssignedComplaints,
      recentAssignedComplaints,
    };
  },

  /**
   * Get Complaints by Status chart data
   */
  getComplaintsByStatusChart: async (
    user: DashboardUserContext,
    querySocietyId?: string
  ): Promise<{ status: string; count: number }[]> => {
    const filter = buildDashboardFilter(user, querySocietyId);
    const results = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const allStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
    const statusMap = results.reduce(
      (acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      },
      {} as Record<string, number>
    );

    return allStatuses.map((status) => ({
      status,
      count: statusMap[status] || 0,
    }));
  },

  /**
   * Get Complaints by Category chart data
   */
  getComplaintsByCategoryChart: async (
    user: DashboardUserContext,
    querySocietyId?: string
  ): Promise<{ category: string; count: number }[]> => {
    const filter = buildDashboardFilter(user, querySocietyId);
    const results = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const allCategories = [
      'Maintenance',
      'Plumbing',
      'Electrical',
      'Security',
      'Housekeeping',
      'Other',
    ];
    const categoryMap = results.reduce(
      (acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      },
      {} as Record<string, number>
    );

    return allCategories.map((category) => ({
      category,
      count: categoryMap[category] || 0,
    }));
  },

  /**
   * Get Monthly Complaint Trend (last 12 months)
   */
  getMonthlyComplaintTrendChart: async (
    user: DashboardUserContext,
    querySocietyId?: string
  ): Promise<{ month: string; count: number }[]> => {
    const filter = buildDashboardFilter(user, querySocietyId);

    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    filter.createdAt = { $gte: twelveMonthsAgo };

    const results = await Complaint.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthsList: { label: string; year: number; month: number; count: number }[] = [];
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1; // MongoDB month is 1-indexed (1-12)
      const label = `${monthNames[d.getMonth()]} ${y}`;
      monthsList.push({ label, year: y, month: m, count: 0 });
    }

    results.forEach((res) => {
      const match = monthsList.find((m) => m.year === res._id.year && m.month === res._id.month);
      if (match) {
        match.count = res.count;
      }
    });

    return monthsList.map((m) => ({
      month: m.label,
      count: m.count,
    }));
  },
};
