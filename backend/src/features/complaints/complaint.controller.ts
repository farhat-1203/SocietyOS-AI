import type { Response } from 'express';
import type { AuthenticatedRequest } from '@/types/express';
import { sendSuccess, sendCreated, sendSuccessWithPagination } from '@utils/response';
import { ValidationError, AuthorizationError, NotFoundError } from '@utils/errors';
import { getPaginationFromQuery, formatPaginationMeta } from '@utils/helpers';
import { complaintService } from './complaint.service';
import type { ComplaintQueryInput } from './complaint.validation';

// ─── Helper ───────────────────────────────────────────────────────────────────

const isSuperAdmin = (req: AuthenticatedRequest): boolean =>
  req.user?.roles?.includes('Super Admin') ?? false;

const isSocietyAdmin = (req: AuthenticatedRequest): boolean =>
  req.user?.roles?.includes('Society Admin') ?? false;

const isVendor = (req: AuthenticatedRequest): boolean =>
  req.user?.roles?.includes('Vendor') ?? false;

// ─── Create Complaint ─────────────────────────────────────────────────────────

export const createComplaint = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  if (!req.user || !req.tenancy) {
    throw new ValidationError('Authentication context required');
  }

  const complaint = await complaintService.createComplaint(
    req.body,
    req.tenancy.societyId,
    req.user.userId
  );

  return sendCreated(res, complaint, 'Complaint submitted successfully');
};

// ─── Get Complaint By ID ──────────────────────────────────────────────────────

export const getComplaintById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  if (!req.user || !req.tenancy) {
    throw new ValidationError('Authentication context required');
  }

  const { id } = req.params;
  const complaint = await complaintService.getComplaintById(id);

  if (!complaint) {
    throw new NotFoundError('Complaint', id);
  }

  // Super Admins see any complaint
  if (isSuperAdmin(req)) {
    return sendSuccess(res, complaint);
  }

  // Society Admins must be in the same society
  if (isSocietyAdmin(req)) {
    if (complaint.societyId.toString() !== req.tenancy.societyId) {
      throw new AuthorizationError('Complaint does not belong to your society');
    }
    return sendSuccess(res, complaint);
  }

  // Vendors may only view if assigned to them
  if (isVendor(req)) {
    if (complaint.assignedTo?.toString() !== req.user.userId) {
      throw new AuthorizationError('You are not assigned to this complaint');
    }
    return sendSuccess(res, complaint);
  }

  // Residents may only view their own complaints
  if (complaint.createdBy.toString() !== req.user.userId) {
    throw new AuthorizationError('You can only view your own complaints');
  }

  return sendSuccess(res, complaint);
};

// ─── List Complaints ──────────────────────────────────────────────────────────

export const listComplaints = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  if (!req.user || !req.tenancy) {
    throw new ValidationError('Authentication context required');
  }

  const { page, limit, skip } = getPaginationFromQuery(req.query as Record<string, unknown>);

  // Build query filters (strip pagination keys)
  const rawQuery = req.query as Record<string, unknown>;
  const query: ComplaintQueryInput = {
    status: rawQuery.status as ComplaintQueryInput['status'],
    priority: rawQuery.priority as ComplaintQueryInput['priority'],
    category: rawQuery.category as ComplaintQueryInput['category'],
    assignedTo: rawQuery.assignedTo as string | undefined,
    createdBy: rawQuery.createdBy as string | undefined,
  };

  // ── Super Admin: cross-society ──
  if (isSuperAdmin(req)) {
    const [complaints, total] = await Promise.all([
      complaintService.listAllComplaints(query, { skip, limit }),
      complaintService.countAllComplaints(query),
    ]);

    return sendSuccessWithPagination(res, complaints, formatPaginationMeta(page, limit, total));
  }

  // ── Society Admin: all complaints in their society ──
  if (isSocietyAdmin(req)) {
    const [complaints, total] = await Promise.all([
      complaintService.listSocietyComplaints(req.tenancy.societyId, query, { skip, limit }),
      complaintService.countSocietyComplaints(req.tenancy.societyId, query),
    ]);

    return sendSuccessWithPagination(res, complaints, formatPaginationMeta(page, limit, total));
  }

  // ── Vendor: only assigned complaints ──
  if (isVendor(req)) {
    const [complaints, total] = await Promise.all([
      complaintService.listAssignedComplaints(req.user.userId, query, { skip, limit }),
      complaintService.countAssignedComplaints(req.user.userId, query),
    ]);

    return sendSuccessWithPagination(res, complaints, formatPaginationMeta(page, limit, total));
  }

  // ── Resident: only their own complaints ──
  const [complaints, total] = await Promise.all([
    complaintService.listOwnComplaints(req.tenancy.societyId, req.user.userId, query, {
      skip,
      limit,
    }),
    complaintService.countOwnComplaints(req.tenancy.societyId, req.user.userId, query),
  ]);

  return sendSuccessWithPagination(res, complaints, formatPaginationMeta(page, limit, total));
};

// ─── Assign Complaint ─────────────────────────────────────────────────────────

export const assignComplaint = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  if (!req.user || !req.tenancy) {
    throw new ValidationError('Authentication context required');
  }

  const { id } = req.params;

  const updated = await complaintService.assignComplaint(id, req.tenancy.societyId, req.body);

  if (!updated) {
    throw new NotFoundError('Complaint', id);
  }

  return sendSuccess(res, updated, { message: 'Complaint assigned successfully' });
};

// ─── Update Status ────────────────────────────────────────────────────────────

export const updateComplaintStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  if (!req.user || !req.tenancy) {
    throw new ValidationError('Authentication context required');
  }

  const { id } = req.params;

  const updated = await complaintService.updateStatus(id, req.tenancy.societyId, req.body);

  if (!updated) {
    throw new NotFoundError('Complaint', id);
  }

  return sendSuccess(res, updated, { message: 'Complaint status updated' });
};

// ─── Resolve Complaint ────────────────────────────────────────────────────────

export const resolveComplaint = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  if (!req.user || !req.tenancy) {
    throw new ValidationError('Authentication context required');
  }

  const { id } = req.params;

  const updated = await complaintService.resolveComplaint(
    id,
    req.tenancy.societyId,
    req.user.userId,
    req.body
  );

  if (!updated) {
    throw new NotFoundError('Complaint', id);
  }

  return sendSuccess(res, updated, { message: 'Complaint resolved successfully' });
};

// ─── Close Complaint ──────────────────────────────────────────────────────────

export const closeComplaint = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  if (!req.user || !req.tenancy) {
    throw new ValidationError('Authentication context required');
  }

  const { id } = req.params;

  const updated = await complaintService.closeComplaint(id, req.tenancy.societyId);

  if (!updated) {
    throw new NotFoundError('Complaint', id);
  }

  return sendSuccess(res, updated, { message: 'Complaint closed successfully' });
};

// ─── Vendor: Add Note ─────────────────────────────────────────────────────────

export const addVendorNote = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const { id } = req.params;

  const updated = await complaintService.addVendorNote(id, req.user.userId, req.body);

  if (!updated) {
    throw new NotFoundError('Complaint', id);
  }

  return sendSuccess(res, updated, { message: 'Note added successfully' });
};

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export const getDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  if (!req.user || !req.tenancy) {
    throw new ValidationError('Authentication context required');
  }

  if (isSuperAdmin(req)) {
    const stats = await complaintService.getGlobalDashboardStats();
    return sendSuccess(res, stats);
  }

  const stats = await complaintService.getDashboardStats(req.tenancy.societyId);
  return sendSuccess(res, stats);
};
