import { Router } from "express";
import { requireDistrictAdmin } from "../middleware/districtAdminAuth";
import { getDashboard, getChartData } from "../controllers/dashboard.controller";
import { getPipelineStatus } from "../controllers/pipeline.controller";
import { getBottlenecks } from "../controllers/bottleneck.controller";
import { getBlocks } from "../controllers/block.controller";
import { getSchools } from "../controllers/school.controller";
import {
  getBlockAdmins, createBlockAdmin, updateBlockAdmin,
  deactivateBlockAdmin, resetBlockAdminPassword,
} from "../controllers/blockAdmin.controller";
import { getAnalytics } from "../controllers/analytics.controller";
import { generateReport, getReportHistory } from "../controllers/report.controller";
import {
  getNotifications, markAsRead, markAllAsRead,
} from "../controllers/notification.controller";
import { validate } from "../../middleware/validate";
import { z } from "zod";

const router = Router();

router.use(requireDistrictAdmin);

router.get("/dashboard", getDashboard);
router.get("/dashboard/charts", getChartData);

router.get("/pipeline", getPipelineStatus);

router.get("/bottlenecks", getBottlenecks);

router.get("/blocks", getBlocks);

router.get("/schools", getSchools);

router.get("/block-admins", getBlockAdmins);
router.post("/block-admins", validate(z.object({
  name: z.string().min(2),
  email: z.string().email(),
  employeeId: z.string().min(3),
  password: z.string().min(8),
  block: z.string().optional(),
  assignedBlocks: z.array(z.string()).optional(),
})), createBlockAdmin);
router.put("/block-admins/:id", updateBlockAdmin);
router.patch("/block-admins/:id/deactivate", deactivateBlockAdmin);
router.post("/block-admins/:id/reset-password", validate(z.object({ password: z.string().min(8) })), resetBlockAdminPassword);

router.get("/analytics", getAnalytics);

router.get("/reports", generateReport);
router.get("/reports/history", getReportHistory);

router.get("/notifications", getNotifications);
router.patch("/notifications/:id/read", markAsRead);
router.patch("/notifications/read-all", markAllAsRead);

export default router;
