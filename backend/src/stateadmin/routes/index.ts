import { Router } from "express";
import { z } from "zod";
import { requireStateAdmin } from "../middleware/stateAdminAuth";
import { getDashboard, getChartData } from "../controllers/dashboard.controller";
import { getDistricts, getDistrictById } from "../controllers/district.controller";
import { getSchools, getSchoolById } from "../controllers/school.controller";
import {
  getDistrictAdmins, createDistrictAdmin, updateDistrictAdmin,
  deactivateDistrictAdmin, resetDistrictAdminPassword, getDistrictAdminLoginHistory,
} from "../controllers/districtAdmin.controller";
import { getLockedSchools, unlockSchool } from "../controllers/lockedSchool.controller";
import {
  getLowPerformingDistricts, getInfrastructureRequests, getCertificationByDistrict,
} from "../controllers/monitoring.controller";
import { generateReport } from "../controllers/report.controller";
import { validate } from "../../middleware/validate";
import {
  createDistrictAdminSchema, updateDistrictAdminSchema, unlockSchoolSchema,
} from "../validators";

const router = Router();

router.use(requireStateAdmin);

router.get("/dashboard", getDashboard);
router.get("/dashboard/charts", getChartData);

router.get("/districts", getDistricts);
router.get("/districts/low-performing", getLowPerformingDistricts);
router.get("/districts/certification", getCertificationByDistrict);
router.get("/districts/:id", getDistrictById);

router.get("/schools", getSchools);
router.get("/schools/locked", getLockedSchools);
router.get("/schools/:id", getSchoolById);

router.get("/district-admin", getDistrictAdmins);
router.post("/district-admin", validate(createDistrictAdminSchema), createDistrictAdmin);
router.put("/district-admin/:id", validate(updateDistrictAdminSchema), updateDistrictAdmin);
router.patch("/district-admin/:id/deactivate", deactivateDistrictAdmin);
router.post(
  "/district-admin/:id/reset-password",
  validate(z.object({ password: z.string().min(8) })),
  resetDistrictAdminPassword
);
router.get("/district-admin/:id/login-history", getDistrictAdminLoginHistory);

router.post("/unlock-school", validate(unlockSchoolSchema), unlockSchool);
router.get("/infrastructure-requests", getInfrastructureRequests);

router.get("/reports", generateReport);

export default router;