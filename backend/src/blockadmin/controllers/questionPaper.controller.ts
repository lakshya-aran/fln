import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { QuestionPaper } from "../models/QuestionPaper";
import { PrintRequest } from "../models/PrintRequest";
import { baAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { getBlockFilter } from "../middleware/blockAdminAuth";
import { createBlockAuditLog } from "../services/audit.service";

function generatePaperCode(block: string, schoolId: string, subject: string, grade: number): string {
  const t = Date.now().toString(36).toUpperCase();
  return `QP-${block.toUpperCase().substring(0, 4)}-${subject.toUpperCase().substring(0, 3)}-G${grade}-${t}`;
}

export const getQuestionPapers = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const blockFilter = getBlockFilter(req);
    const { schoolId, subject, grade } = req.query;
    const filter: Record<string, unknown> = { ...blockFilter };
    if (schoolId) filter.schoolId = schoolId;
    if (subject) filter.subject = subject;
    if (grade) filter.grade = Number(grade);

    const papers = await QuestionPaper.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    sendSuccess(res, { data: papers });
  }
);

export const generateQuestionPaper = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const u = req.user as any;
    const blockFilter = getBlockFilter(req);
    const { schoolId, school, subject, grade, language, version, reason, questionsCount, volunteerId } = req.body;

    if (!u.blocks.some((b: string) => blockFilter.block.$in.includes(b))) {
      // ok
    }

    const existing = await QuestionPaper.findOne({ ...blockFilter, schoolId, subject, grade, version: version || 1 });
    if (existing) {
      sendError(res, `Question paper already exists for this school/subject/grade/version: ${existing.paperCode}`, 409);
      return;
    }

    const paperCode = generatePaperCode(u.block, schoolId, subject, grade);

    const paper = await QuestionPaper.create({
      block: u.block,
      district: u.assignedDistrict,
      state: u.assignedState,
      school,
      schoolId,
      subject,
      grade,
      language: language || "english",
      version: version || 1,
      reason: reason || "manual",
      questionsCount: questionsCount || 20,
      paperCode,
      generatedBy: u.name,
      generatedById: u.userId,
      volunteerId: volunteerId || null,
      locked: true,
      lockedAt: new Date(),
      downloadUrl: `/api/block/question-papers/${paperCode}/download`,
    });

    await createBlockAuditLog(
      {
        user: u.name,
        userId: u.userId,
        userRole: "block_officer",
        action: "generate_question_paper",
        resource: "QuestionPaper",
        resourceId: paperCode,
        description: `Generated question paper for ${school} (${subject}, grade ${grade})`,
        after: { paperCode, school, subject, grade, reason, locked: true },
        block: u.block,
        district: u.assignedDistrict,
      },
      req
    );

    sendSuccess(res, { data: paper }, 201);
  }
);

export const printPaper = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const u = req.user as any;
    const blockFilter = getBlockFilter(req);
    const { paperCode, copies, reason, volunteerId, notes } = req.body;

    const paper = await QuestionPaper.findOne({ paperCode, ...blockFilter });
    if (!paper) {
      sendError(res, "Question paper not found in your block", 404);
      return;
    }
    if (!paper.locked) {
      sendError(res, "Question paper cannot be regenerated. Locked already.", 400);
      return;
    }

    const printRequest = await PrintRequest.create({
      block: u.block,
      district: u.assignedDistrict,
      state: u.assignedState,
      school: paper.school,
      schoolId: paper.schoolId,
      paperCode,
      copies: copies || 30,
      reason: reason || "",
      status: "pending",
      requestedBy: u.name,
      requestedById: u.userId,
      volunteerId: volunteerId || null,
      notes: notes || "",
    });

    paper.printedAt = new Date();
    paper.printedBy = u.name;
    await paper.save();

    await createBlockAuditLog(
      {
        user: u.name,
        userId: u.userId,
        userRole: "block_officer",
        action: "print_question_paper",
        resource: "PrintRequest",
        resourceId: String(printRequest._id),
        description: `Print request for ${paperCode} (${copies} copies)`,
        after: { paperCode, copies, status: "pending" },
        block: u.block,
        district: u.assignedDistrict,
      },
      req
    );

    sendSuccess(res, { data: printRequest }, 201);
  }
);

export const getPrintRequests = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const blockFilter = getBlockFilter(req);
    const { status } = req.query;
    const filter: Record<string, unknown> = { ...blockFilter };
    if (status) filter.status = status;
    const requests = await PrintRequest.find(filter).sort({ createdAt: -1 }).limit(50).lean();
    sendSuccess(res, { data: requests });
  }
);

export const updatePrintRequestStatus = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const blockFilter = getBlockFilter(req);
    const { id } = req.params;
    const { status } = req.body;
    const valid = ["pending", "in_progress", "ready", "delivered", "collected"];
    if (!valid.includes(status)) {
      sendError(res, "Invalid status", 400);
      return;
    }
    const updated = await PrintRequest.findOneAndUpdate(
      { _id: id, ...blockFilter },
      { $set: { status } },
      { new: true }
    );
    if (!updated) {
      sendError(res, "Print request not found", 404);
      return;
    }
    sendSuccess(res, { data: updated });
  }
);