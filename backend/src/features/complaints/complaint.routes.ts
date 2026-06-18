import { Router } from 'express';
import * as complaintController from './complaint.controller';
import { authMiddleware, checkPermission } from '@middleware/auth';
import { tenancyMiddleware } from '@middleware/tenancy';
import { validateBody, validateParams } from '@middleware/validation';
import {
  createComplaintSchema,
  assignComplaintSchema,
  updateComplaintStatusSchema,
  resolveComplaintSchema,
  addVendorNoteSchema,
} from './complaint.validation';
import { idParamSchema } from '@utils/validators';
import { asyncHandler } from '@utils/asyncHandler';

const router = Router();

// Apply auth + tenancy to all complaint routes
router.use(authMiddleware);
router.use(tenancyMiddleware);

// ─── Dashboard ────────────────────────────────────────────────────────────────
// GET /api/complaints/stats
router.get(
  '/stats',
  checkPermission('complaints', 'read'),
  asyncHandler(complaintController.getDashboardStats)
);

// ─── List Complaints ──────────────────────────────────────────────────────────
// GET /api/complaints
// Role-scoped: Resident → own | Admin → society | Super Admin → all | Vendor → assigned
router.get(
  '/',
  checkPermission('complaints', 'read'),
  asyncHandler(complaintController.listComplaints)
);

// ─── Create Complaint ─────────────────────────────────────────────────────────
// POST /api/complaints
router.post(
  '/',
  checkPermission('complaints', 'create'),
  validateBody(createComplaintSchema),
  asyncHandler(complaintController.createComplaint)
);

// ─── Get Complaint By ID ──────────────────────────────────────────────────────
// GET /api/complaints/:id
router.get(
  '/:id',
  checkPermission('complaints', 'read'),
  validateParams(idParamSchema),
  asyncHandler(complaintController.getComplaintById)
);

// ─── Assign Complaint ─────────────────────────────────────────────────────────
// PATCH /api/complaints/:id/assign
router.patch(
  '/:id/assign',
  checkPermission('complaints', 'assign'),
  validateParams(idParamSchema),
  validateBody(assignComplaintSchema),
  asyncHandler(complaintController.assignComplaint)
);

// ─── Update Status ────────────────────────────────────────────────────────────
// PATCH /api/complaints/:id/status
router.patch(
  '/:id/status',
  checkPermission('complaints', 'update'),
  validateParams(idParamSchema),
  validateBody(updateComplaintStatusSchema),
  asyncHandler(complaintController.updateComplaintStatus)
);

// ─── Resolve Complaint ────────────────────────────────────────────────────────
// PATCH /api/complaints/:id/resolve
router.patch(
  '/:id/resolve',
  checkPermission('complaints', 'resolve'),
  validateParams(idParamSchema),
  validateBody(resolveComplaintSchema),
  asyncHandler(complaintController.resolveComplaint)
);

// ─── Close Complaint ──────────────────────────────────────────────────────────
// PATCH /api/complaints/:id/close
router.patch(
  '/:id/close',
  checkPermission('complaints', 'close'),
  validateParams(idParamSchema),
  asyncHandler(complaintController.closeComplaint)
);

// ─── Vendor: Add Note ─────────────────────────────────────────────────────────
// PATCH /api/complaints/:id/note
router.patch(
  '/:id/note',
  checkPermission('complaints', 'update'),
  validateParams(idParamSchema),
  validateBody(addVendorNoteSchema),
  asyncHandler(complaintController.addVendorNote)
);

export default router;
