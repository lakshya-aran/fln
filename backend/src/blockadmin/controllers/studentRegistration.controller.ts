import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { StudentRegistration } from "../models/StudentRegistration";
import { baAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { getBlockFilter } from "../middleware/blockAdminAuth";
import { createBlockAuditLog } from "../services/audit.service";

export const getRegistrations = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const blockFilter = getBlockFilter(req);
    const { status, registrationType, schoolId } = req.query;
    const filter: Record<string, unknown> = { ...blockFilter };
    if (status) filter.status = status;
    if (registrationType) filter.registrationType = registrationType;
    if (schoolId) filter.schoolId = schoolId;

    const registrations = await StudentRegistration.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    sendSuccess(res, { data: registrations });
  }
);

export const getRegistrationById = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const blockFilter = getBlockFilter(req);
    const reg = await StudentRegistration.findOne({ _id: req.params.id, ...blockFilter }).lean();
    if (!reg) {
      sendError(res, "Registration not found", 404);
      return;
    }
    sendSuccess(res, { data: reg });
  }
);

export const createRegistration = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const u = req.user as any;
    const blockFilter = getBlockFilter(req);
    const {
      schoolId, school, registrationType, volunteerId, volunteerName,
      studentName, guardianName, guardianPhone, grade, classSection, address, documents,
    } = req.body;

    const registration = await StudentRegistration.create({
      block: u.block,
      district: u.assignedDistrict,
      state: u.assignedState,
      school,
      schoolId,
      registrationType,
      status: "pending",
      verificationStatus: "pending",
      volunteerId,
      volunteerName,
      studentName,
      guardianName,
      guardianPhone: guardianPhone || "",
      grade,
      classSection: classSection || "",
      address: address || "",
      documents: documents || [],
    });

    await createBlockAuditLog(
      {
        user: u.name,
        userId: u.userId,
        userRole: "block_officer",
        action: "create_student_registration",
        resource: "StudentRegistration",
        resourceId: String(registration._id),
        description: `Student registration: ${studentName} (${registrationType}) at ${school}`,
        after: { studentName, registrationType, school },
        block: u.block,
        district: u.assignedDistrict,
      },
      req
    );

    sendSuccess(res, { data: registration }, 201);
  }
);

export const updateRegistration = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const u = req.user as any;
    const blockFilter = getBlockFilter(req);
    const { id } = req.params;
    const { status, verificationStatus, rejectionReason } = req.body;

    const before = await StudentRegistration.findOne({ _id: id, ...blockFilter }).lean();
    if (!before) {
      sendError(res, "Registration not found", 404);
      return;
    }

    const update: Record<string, unknown> = { status };
    if (verificationStatus) update.verificationStatus = verificationStatus;
    if (rejectionReason) update.rejectionReason = rejectionReason;
    if (status === "approved" || status === "rejected") {
      update.approvedBy = u.name;
      update.approvedAt = new Date();
    }

    const after = await StudentRegistration.findByIdAndUpdate(id, { $set: update }, { new: true });

    await createBlockAuditLog(
      {
        user: u.name,
        userId: u.userId,
        userRole: "block_officer",
        action: status === "approved" ? "approve_student_registration" : "reject_student_registration",
        resource: "StudentRegistration",
        resourceId: id,
        description: `Registration ${status}: ${before.studentName}`,
        before: { status: before.status },
        after: { status, verificationStatus, rejectionReason },
        block: u.block,
        district: u.assignedDistrict,
      },
      req
    );

    sendSuccess(res, { data: after });
  }
);