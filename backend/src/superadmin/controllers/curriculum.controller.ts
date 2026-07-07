import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { Curriculum } from "../models/Curriculum";
import { createAuditLog } from "../services/audit.service";
import { curriculumSchema } from "../validators";
import { saAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getCurricula = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { subject, grade, language, status } = req.query;
    const filter: Record<string, unknown> = {};
    if (subject) filter.subject = subject;
    if (grade) filter.grade = grade;
    if (language) filter.language = language;
    if (status) filter.status = status;
    const curricula = await Curriculum.find(filter).sort({ updatedAt: -1 });
    sendSuccess(res, { curricula });
  }
);

export const getCurriculumById = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const curriculum = await Curriculum.findById(req.params.id);
    if (!curriculum) {
      sendError(res, "Curriculum not found", 404);
      return;
    }
    sendSuccess(res, { curriculum });
  }
);

export const createCurriculum = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const data = curriculumSchema.parse(req.body);
    const curriculum = await Curriculum.create({
      ...data,
      createdBy: req.user!.userId,
      versions: [{
        version: 1,
        content: data.content,
        author: req.user!.userId,
        authorId: req.user!.userId,
        notes: data.versionNotes || "Initial version",
        createdAt: new Date(),
      }],
    });
    await createAuditLog({
      user: req.user!.userId,
      userId: req.user!.userId,
      userRole: "national_admin",
      action: "CREATE_CURRICULUM",
      resource: "Curriculum",
      resourceId: curriculum._id.toString(),
      description: `Created curriculum "${curriculum.title}" for ${curriculum.grade} ${curriculum.subject}`,
    }, req);
    sendSuccess(res, { curriculum }, 201);
  }
);

export const updateCurriculum = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const curriculum = await Curriculum.findById(req.params.id);
    if (!curriculum) {
      sendError(res, "Curriculum not found", 404);
      return;
    }
    const before = { content: curriculum.content, status: curriculum.status };
    const isNewVersion = req.body.versionNotes || (req.body.content && req.body.content !== curriculum.content);
    if (isNewVersion && req.body.content) {
      const newVersion = (curriculum.currentVersion || 0) + 1;
      curriculum.versions.push({
        version: newVersion,
        content: req.body.content,
        author: req.user!.userId,
        authorId: req.user!.userId,
        notes: req.body.versionNotes || `Version ${newVersion}`,
        createdAt: new Date(),
      });
      curriculum.currentVersion = newVersion;
    }
    const allowedUpdates = ["title", "content", "status", "learningOutcomes", "competencies", "language"];
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        (curriculum as any)[field] = req.body[field];
      }
    }
    await curriculum.save();
    await createAuditLog({
      user: req.user!.userId,
      userId: req.user!.userId,
      userRole: "national_admin",
      action: "UPDATE_CURRICULUM",
      resource: "Curriculum",
      resourceId: curriculum._id.toString(),
      description: `Updated curriculum "${curriculum.title}" (v${curriculum.currentVersion})`,
      before,
      after: { content: curriculum.content, status: curriculum.status, currentVersion: curriculum.currentVersion },
    }, req);
    sendSuccess(res, { curriculum });
  }
);

export const restoreCurriculumVersion = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { version } = req.params;
    const curriculum = await Curriculum.findById(req.params.id);
    if (!curriculum) {
      sendError(res, "Curriculum not found", 404);
      return;
    }
    const targetVersion = curriculum.versions.find(
      (v) => v.version === parseInt(version)
    );
    if (!targetVersion) {
      sendError(res, "Version not found", 404);
      return;
    }
    const newVersion = (curriculum.currentVersion || 0) + 1;
    curriculum.versions.push({
      version: newVersion,
      content: targetVersion.content,
      author: req.user!.userId,
      authorId: req.user!.userId,
      notes: `Restored from version ${targetVersion.version}`,
      createdAt: new Date(),
    });
    curriculum.content = targetVersion.content;
    curriculum.currentVersion = newVersion;
    await curriculum.save();
    await createAuditLog({
      user: req.user!.userId,
      userId: req.user!.userId,
      userRole: "national_admin",
      action: "RESTORE_CURRICULUM_VERSION",
      resource: "Curriculum",
      resourceId: curriculum._id.toString(),
      description: `Restored curriculum to version ${targetVersion.version}`,
    }, req);
    sendSuccess(res, { curriculum });
  }
);
