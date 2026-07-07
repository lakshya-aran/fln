import { Router } from "express";
import { requireSuperadmin } from "../middleware/superadminAuth";
import { validate } from "../../middleware/validate";
import {
  createAdminSchema, updateAdminSchema, calendarSchema,
  curriculumSchema, questionReviewSchema, announcementSchema, feedbackUpdateSchema,
} from "../validators";

import { getDashboard, getNationwideStats } from "../controllers/dashboard.controller";
import { createAdmin, getAdmins, getAdminById, updateAdmin, deactivateAdmin, resetAdminPassword } from "../controllers/admin.controller";
import { getCalendars, getCalendarById, createCalendar, updateCalendar } from "../controllers/calendar.controller";
import { getCurricula, getCurriculumById, createCurriculum, updateCurriculum, restoreCurriculumVersion } from "../controllers/curriculum.controller";
import { getQuestionReviews, updateQuestionReview } from "../controllers/questionReview.controller";
import { getVisualAssets, getVisualAssetById, createVisualAsset, replaceVisualAsset } from "../controllers/visualAsset.controller";
import { getFeedbacks, updateFeedback } from "../controllers/feedback.controller";
import { getAnnouncements, getAnnouncementById, createAnnouncement, updateAnnouncement } from "../controllers/announcement.controller";
import { unlockSchool, searchSchool } from "../controllers/unlock.controller";
import { getAnalytics, getAssessmentStats } from "../controllers/analytics.controller";
import { getAuditLogs } from "../controllers/audit.controller";

const router = Router();

router.use(requireSuperadmin);

router.get("/dashboard", getDashboard);
router.get("/dashboard/stats", getNationwideStats);
router.get("/analytics", getAnalytics);
router.get("/analytics/assessments", getAssessmentStats);

router.get("/admin", getAdmins);
router.post("/admin", validate(createAdminSchema), createAdmin);
router.get("/admin/:id", getAdminById);
router.put("/admin/:id", validate(updateAdminSchema), updateAdmin);
router.patch("/admin/:id/deactivate", deactivateAdmin);
router.post("/admin/:id/reset-password", resetAdminPassword);

router.get("/calendar", getCalendars);
router.get("/calendar/:id", getCalendarById);
router.post("/calendar", validate(calendarSchema), createCalendar);
router.put("/calendar/:id", updateCalendar);

router.get("/curriculum", getCurricula);
router.get("/curriculum/:id", getCurriculumById);
router.post("/curriculum", validate(curriculumSchema), createCurriculum);
router.put("/curriculum/:id", updateCurriculum);
router.post("/curriculum/:id/restore/:version", restoreCurriculumVersion);

router.get("/question-review", getQuestionReviews);
router.put("/question-review/:id", validate(questionReviewSchema), updateQuestionReview);

router.get("/visual-assets", getVisualAssets);
router.get("/visual-assets/:id", getVisualAssetById);
router.post("/visual-assets", createVisualAsset);
router.put("/visual-assets/:id/replace", replaceVisualAsset);

router.get("/feedback", getFeedbacks);
router.put("/feedback/:id", validate(feedbackUpdateSchema), updateFeedback);

router.get("/announcements", getAnnouncements);
router.get("/announcements/:id", getAnnouncementById);
router.post("/announcements", validate(announcementSchema), createAnnouncement);
router.put("/announcements/:id", updateAnnouncement);

router.post("/unlock-school", unlockSchool);
router.get("/search-school", searchSchool);

router.get("/audit", getAuditLogs);

export default router;
