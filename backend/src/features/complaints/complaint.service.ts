import mongoose from 'mongoose';
import Complaint, { IComplaint } from './complaint.model';
import type {
  CreateComplaintInput,
  AssignComplaintInput,
  UpdateComplaintStatusInput,
  ResolveComplaintInput,
  AddVendorNoteInput,
  ComplaintQueryInput,
} from './complaint.validation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaginationOptions {
  page?: number;
  limit?: number;
  skip?: number;
}

interface BuildFilterOptions extends ComplaintQueryInput {
  societyId?: string;
  createdBy?: string;
  assignedTo?: string;
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

const buildFilter = (options: BuildFilterOptions): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};

  if (options.societyId) {
    filter.societyId = new mongoose.Types.ObjectId(options.societyId);
  }
  if (options.createdBy) {
    filter.createdBy = new mongoose.Types.ObjectId(options.createdBy);
  }
  if (options.assignedTo) {
    filter.assignedTo = new mongoose.Types.ObjectId(options.assignedTo);
  }
  if (options.status) {
    filter.status = options.status;
  }
  if (options.priority) {
    filter.priority = options.priority;
  }
  if (options.category) {
    filter.category = options.category;
  }

  return filter;
};

// ─── Complaint Service ────────────────────────────────────────────────────────

export const complaintService = {
  /**
   * Create a new complaint (Resident)
   */
  createComplaint: async (
    data: CreateComplaintInput,
    societyId: string,
    createdBy: string
  ): Promise<IComplaint> => {
    const complaint = new Complaint({
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority ?? 'Medium',
      attachments: data.attachments ?? [],
      societyId: new mongoose.Types.ObjectId(societyId),
      createdBy: new mongoose.Types.ObjectId(createdBy),
      status: 'Open',
    });

    return complaint.save();
  },

  /**
   * Get a single complaint by ID
   * Returns null if not found
   */
  getComplaintById: async (complaintId: string): Promise<IComplaint | null> => {
    return Complaint.findById(complaintId)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email');
  },

  /**
   * List complaints for a RESIDENT (only their own)
   */
  listOwnComplaints: async (
    societyId: string,
    createdBy: string,
    query: ComplaintQueryInput,
    pagination: PaginationOptions = {}
  ): Promise<IComplaint[]> => {
    const { skip = 0, limit = 20 } = pagination;

    const filter = buildFilter({ societyId, createdBy, ...query });

    return Complaint.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  },

  /**
   * Count own complaints (for pagination)
   */
  countOwnComplaints: async (
    societyId: string,
    createdBy: string,
    query: ComplaintQueryInput
  ): Promise<number> => {
    const filter = buildFilter({ societyId, createdBy, ...query });
    return Complaint.countDocuments(filter);
  },

  /**
   * List all complaints in a society (Society Admin)
   */
  listSocietyComplaints: async (
    societyId: string,
    query: ComplaintQueryInput,
    pagination: PaginationOptions = {}
  ): Promise<IComplaint[]> => {
    const { skip = 0, limit = 20 } = pagination;

    const filter = buildFilter({ societyId, ...query });

    return Complaint.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  },

  /**
   * Count complaints in a society (for pagination)
   */
  countSocietyComplaints: async (
    societyId: string,
    query: ComplaintQueryInput
  ): Promise<number> => {
    const filter = buildFilter({ societyId, ...query });
    return Complaint.countDocuments(filter);
  },

  /**
   * List ALL complaints across societies (Super Admin)
   */
  listAllComplaints: async (
    query: ComplaintQueryInput,
    pagination: PaginationOptions = {}
  ): Promise<IComplaint[]> => {
    const { skip = 0, limit = 20 } = pagination;

    const filter = buildFilter({ ...query });

    return Complaint.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  },

  /**
   * Count all complaints (Super Admin)
   */
  countAllComplaints: async (query: ComplaintQueryInput): Promise<number> => {
    const filter = buildFilter({ ...query });
    return Complaint.countDocuments(filter);
  },

  /**
   * List complaints assigned to a vendor
   */
  listAssignedComplaints: async (
    assignedTo: string,
    query: ComplaintQueryInput,
    pagination: PaginationOptions = {}
  ): Promise<IComplaint[]> => {
    const { skip = 0, limit = 20 } = pagination;

    const filter = buildFilter({ assignedTo, ...query });

    return Complaint.find(filter)
      .populate('createdBy', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  },

  /**
   * Count assigned complaints (for pagination)
   */
  countAssignedComplaints: async (
    assignedTo: string,
    query: ComplaintQueryInput
  ): Promise<number> => {
    const filter = buildFilter({ assignedTo, ...query });
    return Complaint.countDocuments(filter);
  },

  /**
   * Assign complaint to a user (Society Admin)
   */
  assignComplaint: async (
    complaintId: string,
    societyId: string,
    data: AssignComplaintInput
  ): Promise<IComplaint | null> => {
    return Complaint.findOneAndUpdate(
      { _id: complaintId, societyId: new mongoose.Types.ObjectId(societyId) },
      {
        $set: {
          assignedTo: new mongoose.Types.ObjectId(data.assignedTo),
          status: 'In Progress',
          updatedAt: new Date(),
        },
      },
      { new: true }
    )
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
  },

  /**
   * Update complaint status (Society Admin)
   */
  updateStatus: async (
    complaintId: string,
    societyId: string,
    data: UpdateComplaintStatusInput
  ): Promise<IComplaint | null> => {
    return Complaint.findOneAndUpdate(
      { _id: complaintId, societyId: new mongoose.Types.ObjectId(societyId) },
      { $set: { status: data.status, updatedAt: new Date() } },
      { new: true }
    );
  },

  /**
   * Resolve a complaint (Society Admin)
   */
  resolveComplaint: async (
    complaintId: string,
    societyId: string,
    resolvedBy: string,
    data: ResolveComplaintInput
  ): Promise<IComplaint | null> => {
    return Complaint.findOneAndUpdate(
      { _id: complaintId, societyId: new mongoose.Types.ObjectId(societyId) },
      {
        $set: {
          status: 'Resolved',
          resolvedBy: new mongoose.Types.ObjectId(resolvedBy),
          resolutionNotes: data.resolutionNotes,
          updatedAt: new Date(),
        },
      },
      { new: true }
    )
      .populate('createdBy', 'name email')
      .populate('resolvedBy', 'name email');
  },

  /**
   * Close a complaint (Society Admin)
   */
  closeComplaint: async (complaintId: string, societyId: string): Promise<IComplaint | null> => {
    return Complaint.findOneAndUpdate(
      { _id: complaintId, societyId: new mongoose.Types.ObjectId(societyId) },
      { $set: { status: 'Closed', updatedAt: new Date() } },
      { new: true }
    );
  },

  /**
   * Vendor: add progress note to an assigned complaint
   */
  addVendorNote: async (
    complaintId: string,
    assignedTo: string,
    data: AddVendorNoteInput
  ): Promise<IComplaint | null> => {
    return Complaint.findOneAndUpdate(
      {
        _id: complaintId,
        assignedTo: new mongoose.Types.ObjectId(assignedTo),
      },
      { $set: { resolutionNotes: data.resolutionNotes, updatedAt: new Date() } },
      { new: true }
    );
  },

  // ─── Dashboard Stats ────────────────────────────────────────────────────────

  /**
   * Get dashboard stats scoped to a society
   */
  getDashboardStats: async (
    societyId: string
  ): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    critical: number;
  }> => {
    const scopeId = new mongoose.Types.ObjectId(societyId);

    const [total, open, inProgress, resolved, closed, critical] = await Promise.all([
      Complaint.countDocuments({ societyId: scopeId }),
      Complaint.countDocuments({ societyId: scopeId, status: 'Open' }),
      Complaint.countDocuments({ societyId: scopeId, status: 'In Progress' }),
      Complaint.countDocuments({ societyId: scopeId, status: 'Resolved' }),
      Complaint.countDocuments({ societyId: scopeId, status: 'Closed' }),
      Complaint.countDocuments({ societyId: scopeId, priority: 'Critical' }),
    ]);

    return { total, open, inProgress, resolved, closed, critical };
  },

  /**
   * Get global dashboard stats (Super Admin)
   */
  getGlobalDashboardStats: async (): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    critical: number;
  }> => {
    const [total, open, inProgress, resolved, closed, critical] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Open' }),
      Complaint.countDocuments({ status: 'In Progress' }),
      Complaint.countDocuments({ status: 'Resolved' }),
      Complaint.countDocuments({ status: 'Closed' }),
      Complaint.countDocuments({ priority: 'Critical' }),
    ]);

    return { total, open, inProgress, resolved, closed, critical };
  },
};
