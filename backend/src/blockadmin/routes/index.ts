import { Router } from "express";
import { requireBlockAdmin } from "../middleware/blockAdminAuth";
import { getDashboard, getChartData } from "../controllers/dashboard.controller";
import { getVolunteers, getVolunteerById, updateVolunteer, emergencyReplacement } from "../controllers/volunteer.controller";
import { listNearbySchools, assignVolunteer, updateAssignmentStage, getAssignments, getAssignmentById } from "../controllers/assignment.controller";
import { getQuestionPapers, generateQuestionPaper, printPaper, getPrintRequests, updatePrintRequestStatus } from "../controllers/questionPaper.controller";
import { getSchedules, scheduleAssessment, updateScheduleStatus, getAssessmentPipeline } from "../controllers/assessment.controller";
import { getRegistrations, getRegistrationById, createRegistration, updateRegistration } from "../controllers/studentRegistration.controller";
import { getLockedSchools, viewLockReason, temporaryAccess, resetLogin, unlockSchool, getRecoveryHistory } from "../controllers/schoolRecovery.controller";
import { getAnalytics, getSchools, getSchoolById } from "../controllers/analytics.controller";
import { generateReport } from "../controllers/report.controller";
import { getNotifications, createNotification, markAsRead, markAllAsRead } from "../controllers/notification.controller";
import { validate } from "../../middleware/validate";
import {
  generateQuestionPaperSchema, printPaperSchema, scheduleAssessmentSchema,
  studentRegistrationSchema, updateStudentRegistrationSchema,
  assignVolunteerSchema, updateVolunteerSchema, unlockSchoolSchema,
  createNotificationSchema,
} from "../validators";

const router = Router();

router.use(requireBlockAdmin);

router.get("/dashboard", getDashboard);
router.get("/dashboard/charts", getChartData);

router.get("/analytics", getAnalytics);
router.get("/schools", getSchools);
router.get("/schools/:id", getSchoolById);

router.get("/volunteers", getVolunteers);
router.get("/volunteers/:id", getVolunteerById);
router.put("/volunteers/:id", validate(updateVolunteerSchema), updateVolunteer);
router.post("/volunteers/assign", validate(assignVolunteerSchema), assignVolunteer);
router.post("/volunteers/emergency-replacement", emergencyReplacement);

router.get("/assignments", getAssignments);
router.get("/assignments/nearby-schools", listNearbySchools);
router.get("/assignments/:id", getAssignmentById);
router.put("/assignments/:id", updateAssignmentStage);

router.get("/question-papers", getQuestionPapers);
router.post("/question-papers/generate", validate(generateQuestionPaperSchema), generateQuestionPaper);
router.post("/question-papers/print", validate(printPaperSchema), printPaper);
router.get("/print-requests", getPrintRequests);
router.patch("/print-requests/:id/status", updatePrintRequestStatus);

router.get("/assessment/schedules", getSchedules);
router.post("/assessment/schedule", validate(scheduleAssessmentSchema), scheduleAssessment);
router.patch("/assessment/schedules/:id/status", updateScheduleStatus);
router.get("/assessment/pipeline", getAssessmentPipeline);

router.get("/student-registration", getRegistrations);
router.get("/student-registration/:id", getRegistrationById);
router.post("/student-registration", validate(studentRegistrationSchema), createRegistration);
router.put("/student-registration/:id", validate(updateStudentRegistrationSchema), updateRegistration);

router.get("/locked-schools", getLockedSchools);
router.post("/locked-schools/view", viewLockReason);
router.post("/locked-schools/temporary-access", validate(unlockSchoolSchema), temporaryAccess);
router.post("/locked-schools/reset-login", validate(unlockSchoolSchema), resetLogin);
router.post("/unlock-school", validate(unlockSchoolSchema), unlockSchool);
router.get("/recovery-history", getRecoveryHistory);

router.get("/notifications", getNotifications);
router.post("/notifications", validate(createNotificationSchema), createNotification);
router.patch("/notifications/:id/read", markAsRead);
router.patch("/notifications/read-all", markAllAsRead);

router.get("/reports", generateReport);

export default router;