import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { VisualAsset } from "../models/VisualAsset";
import { createAuditLog } from "../services/audit.service";
import { saAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getVisualAssets = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { type, subject, grade } = req.query;
    const filter: Record<string, unknown> = {};
    if (type) filter.type = type;
    if (subject) filter["tags.subjects"] = subject;
    if (grade) filter["tags.grades"] = grade;
    const assets = await VisualAsset.find(filter).sort({ createdAt: -1 });
    sendSuccess(res, { assets });
  }
);

export const getVisualAssetById = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const asset = await VisualAsset.findById(req.params.id);
    if (!asset) {
      sendError(res, "Visual asset not found", 404);
      return;
    }
    sendSuccess(res, { asset });
  }
);

export const createVisualAsset = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const asset = await VisualAsset.create({
      ...req.body,
      createdBy: req.user!.userId,
      versions: [{
        version: 1,
        url: req.body.url,
        uploadedAt: new Date(),
        uploadedBy: req.user!.userId,
      }],
    });
    await createAuditLog({
      user: req.user!.userId,
      userId: req.user!.userId,
      userRole: "national_admin",
      action: "CREATE_VISUAL_ASSET",
      resource: "VisualAsset",
      resourceId: asset._id.toString(),
      description: `Created visual asset "${asset.title}"`,
    }, req);
    sendSuccess(res, { asset }, 201);
  }
);

export const replaceVisualAsset = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const asset = await VisualAsset.findById(req.params.id);
    if (!asset) {
      sendError(res, "Visual asset not found", 404);
      return;
    }
    const newVersion = (asset.currentVersion || 0) + 1;
    asset.versions.push({
      version: newVersion,
      url: req.body.url,
      uploadedAt: new Date(),
      uploadedBy: req.user!.userId,
    });
    asset.url = req.body.url;
    asset.currentVersion = newVersion;
    if (req.body.title) asset.title = req.body.title;
    if (req.body.tags) asset.tags = req.body.tags;
    await asset.save();
    await createAuditLog({
      user: req.user!.userId,
      userId: req.user!.userId,
      userRole: "national_admin",
      action: "REPLACE_VISUAL_ASSET",
      resource: "VisualAsset",
      resourceId: asset._id.toString(),
      description: `Replaced visual asset "${asset.title}" (v${newVersion})`,
    }, req);
    sendSuccess(res, { asset });
  }
);
