import { connectDatabase } from "../../config/database";
import { SchoolPerformance } from "../../stateadmin/models/SchoolPerformance";
import { User } from "../../models/User";
import { VolunteerAssignment } from "../models/VolunteerAssignment";
import { QuestionPaper } from "../models/QuestionPaper";
import { PrintRequest } from "../models/PrintRequest";
import { StudentRegistration } from "../models/StudentRegistration";
import { AssessmentSchedule } from "../models/AssessmentSchedule";
import { SchoolRecovery } from "../models/SchoolRecovery";
import { BlockNotification } from "../models/BlockNotification";

const BLOCK = "Haveli";
const DISTRICT = "Pune";
const STATE = "Maharashtra";

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}
function daysAhead(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function seedBlockAdmin(): Promise<void> {
  await connectDatabase();

  await User.deleteMany({ block: BLOCK, role: "volunteer" });
  await VolunteerAssignment.deleteMany({ block: BLOCK });
  await QuestionPaper.deleteMany({ block: BLOCK });
  await PrintRequest.deleteMany({ block: BLOCK });
  await StudentRegistration.deleteMany({ block: BLOCK });
  await AssessmentSchedule.deleteMany({ block: BLOCK });
  await SchoolRecovery.deleteMany({ block: BLOCK });
  await BlockNotification.deleteMany({ block: BLOCK });

  const blockOfficer = await User.findOne({ role: "block_officer", block: BLOCK });
  const performedBy = blockOfficer?.name || "Block Admin";
  const performedById = blockOfficer?._id ? String(blockOfficer._id) : "system";

  const haveliSchools = await SchoolPerformance.find({ block: BLOCK }).lean();
  console.log(`Found ${haveliSchools.length} schools in ${BLOCK} block`);

  if (haveliSchools.length === 0) {
    console.log("No schools found in Haveli. Run district seed first.");
    process.exit(1);
  }

  let empCounter = 7000;
  const volunteerIds: Array<{ id: string; name: string; email: string }> = [];

  for (let i = 0; i < 6; i++) {
    empCounter++;
    const name = `Haveli Volunteer ${i + 1}`;
    const email = `vol.haveli.${i + 1}@fln.gov.in`;
    const v = await User.create({
      name,
      email,
      employeeId: `VOL${empCounter}`,
      password: "asdf@ghjk",
      role: "volunteer",
      state: STATE,
      district: DISTRICT,
      block: BLOCK,
      isActive: i !== 5,
    });
    volunteerIds.push({ id: String(v._id), name, email });
  }

  const assignmentRows: any[] = [];
  for (let i = 0; i < 4; i++) {
    const school = haveliSchools[i % haveliSchools.length];
    const v = volunteerIds[i % volunteerIds.length];
    const stageValue: any = i < 2 ? "visit" : "accepted";
    assignmentRows.push({
      block: BLOCK,
      district: DISTRICT,
      state: STATE,
      volunteerId: v.id,
      volunteerName: v.name,
      volunteerEmail: v.email,
      school: school.school,
      schoolId: school.schoolId,
      assignmentStage: stageValue,
      status: i < 2 ? "on_duty" : "assignment_accepted",
      reliabilityScore: 70 + Math.floor(Math.random() * 25),
      availability: "weekday",
      assignedAt: daysAgo(7 + i * 2),
      acceptedAt: daysAgo(6 + i * 2),
      completedAt: null,
    });
  }
  assignmentRows.push({
    block: BLOCK,
    district: DISTRICT,
    state: STATE,
    volunteerId: volunteerIds[2].id,
    volunteerName: volunteerIds[2].name,
    volunteerEmail: volunteerIds[2].email,
    school: haveliSchools[1].school,
    schoolId: haveliSchools[1].schoolId,
    assignmentStage: "completed",
    status: "completed",
    reliabilityScore: 92,
    availability: "weekday",
    assignedAt: daysAgo(20),
    acceptedAt: daysAgo(19),
    completedAt: daysAgo(15),
  });
  await VolunteerAssignment.insertMany(assignmentRows);
  console.log(`${assignmentRows.length} volunteer assignments seeded`);

  const paperRows: any[] = [];
  for (let i = 0; i < 4; i++) {
    const school = haveliSchools[i % haveliSchools.length];
    const subject = ["math", "hindi", "english", "regional"][i % 4] as const;
    const grade = 2 + (i % 3);
    const paperCode = `QP-${BLOCK.toUpperCase().substring(0, 4)}-${subject.toUpperCase().substring(0, 3)}-G${grade}-${Date.now().toString(36).toUpperCase()}-${i}`;
    paperRows.push({
      block: BLOCK,
      district: DISTRICT,
      state: STATE,
      school: school.school,
      schoolId: school.schoolId,
      subject,
      grade,
      language: subject === "hindi" || subject === "regional" ? "hindi" : "english",
      version: 1,
      reason: ["low_strength", "no_internet", "locked_school", "manual"][i] as any,
      questionsCount: 20,
      paperCode,
      generatedBy: performedBy,
      generatedById: performedById,
      volunteerId: volunteerIds[i % volunteerIds.length].id,
      locked: true,
      lockedAt: daysAgo(2 + i),
      printedAt: i < 3 ? daysAgo(1) : null,
      printedBy: i < 3 ? performedBy : null,
      deliveredAt: i < 2 ? daysAgo(0) : null,
      downloadUrl: `/api/block/question-papers/${paperCode}/download`,
    });
  }
  await QuestionPaper.insertMany(paperRows);
  console.log(`${paperRows.length} question papers seeded`);

  const printRows = paperRows.slice(0, 3).map((p, i) => ({
    block: BLOCK,
    district: DISTRICT,
    state: STATE,
    school: p.school,
    schoolId: p.schoolId,
    paperCode: p.paperCode,
    copies: 30,
    reason: ["No internet at school", "School locked", "Low strength"][i],
    status: i === 0 ? "pending" : i === 1 ? "ready" : "delivered",
    requestedBy: performedBy,
    requestedById: performedById,
    volunteerId: volunteerIds[i].id,
  }));
  await PrintRequest.insertMany(printRows);
  console.log(`${printRows.length} print requests seeded`);

  const regRows: any[] = [];
  for (let i = 0; i < 5; i++) {
    const school = haveliSchools[i % haveliSchools.length];
    const v = volunteerIds[i % volunteerIds.length];
    regRows.push({
      block: BLOCK,
      district: DISTRICT,
      state: STATE,
      school: school.school,
      schoolId: school.schoolId,
      registrationType: ["dropout", "new_admission", "missing_records"][i % 3] as any,
      status: i < 2 ? "approved" : "pending",
      verificationStatus: i < 2 ? "verified" : "pending",
      volunteerId: v.id,
      volunteerName: v.name,
      studentName: `Student ${BLOCK}-${i + 1}`,
      guardianName: `Guardian ${i + 1}`,
      guardianPhone: `98${(10000000 + i).toString()}`,
      grade: 1 + (i % 5),
      classSection: ["A", "B", "C"][i % 3],
      address: `${i + 1} Haveli Road, Pune`,
      documents: i < 2 ? ["birth_cert.pdf"] : [],
      approvedBy: i < 2 ? performedBy : null,
      approvedAt: i < 2 ? daysAgo(3) : null,
    });
  }
  await StudentRegistration.insertMany(regRows);
  console.log(`${regRows.length} student registrations seeded`);

  const scheduleRows: any[] = [];
  for (let i = 0; i < 4; i++) {
    const school = haveliSchools[i % haveliSchools.length];
    const subject = ["math", "hindi", "english", "math"][i % 4] as any;
    scheduleRows.push({
      block: BLOCK,
      district: DISTRICT,
      state: STATE,
      school: school.school,
      schoolId: school.schoolId,
      subject,
      grade: 2 + (i % 3),
      scheduledDate: i < 2 ? daysAhead(3 + i) : daysAgo(5 + i),
      session: ["morning", "afternoon", "morning", "full_day"][i] as any,
      volunteerId: volunteerIds[i].id,
      volunteerName: volunteerIds[i].name,
      status: i < 2 ? "scheduled" : "completed",
      locked: true,
      scheduledBy: performedBy,
      scheduledById: performedById,
      notificationSent: true,
    });
  }
  await AssessmentSchedule.insertMany(scheduleRows);
  console.log(`${scheduleRows.length} assessment schedules seeded`);

  const lockedPrincipal = await User.findOne({ block: BLOCK, role: "principal", isActive: false });
  if (lockedPrincipal) {
    await SchoolRecovery.create({
      block: BLOCK,
      district: DISTRICT,
      state: STATE,
      school: lockedPrincipal.school,
      schoolId: lockedPrincipal.email,
      principalEmail: lockedPrincipal.email,
      action: "viewed_lock_reason",
      reason: "Initial lock - too many failed logins",
      performedBy: "system",
      performedById: "system",
      performedByRole: "system",
      ip: "",
      before: {},
      after: {},
    });
  }

  const notifRows = [
    {
      block: BLOCK, district: DISTRICT, state: STATE,
      type: "assignment" as const,
      targetRole: "volunteers" as const,
      title: "New Assignment: Haveli Block",
      message: "You have been assigned to Haveli block for FLN assessment.",
      severity: "info" as const,
      read: false,
    },
    {
      block: BLOCK, district: DISTRICT, state: STATE,
      type: "printing_ready" as const,
      targetRole: "principals" as const,
      title: "Question Papers Ready for Collection",
      message: "Printed question papers are ready for collection at block office.",
      severity: "warning" as const,
      read: false,
    },
    {
      block: BLOCK, district: DISTRICT, state: STATE,
      type: "reminder" as const,
      targetRole: "teachers" as const,
      title: "Assessment Reminder",
      message: "Scheduled assessments for next week. Please prepare schools.",
      severity: "info" as const,
      read: false,
    },
    {
      block: BLOCK, district: DISTRICT, state: STATE,
      type: "emergency" as const,
      targetRole: "all" as const,
      title: "Internet Outage at Pune Govt School A",
      message: "School reports no internet connectivity. Consider volunteer-assisted mode.",
      severity: "critical" as const,
      read: false,
    },
    {
      block: BLOCK, district: DISTRICT, state: STATE,
      type: "milestone" as const,
      targetRole: "all" as const,
      title: "FLN Certification Milestone",
      message: "Pune Govt School A has achieved 100% FLN certification.",
      severity: "info" as const,
      read: true,
    },
  ];
  await BlockNotification.insertMany(notifRows);
  console.log(`${notifRows.length} block notifications seeded`);

  console.log("\n=== Block Admin Seed Complete ===");
  console.log("Block: Haveli (Pune, Maharashtra)");
  console.log("Login at: http://localhost:5173");
  console.log("Email: block.pune@fln.gov.in");
  console.log("Password: asdf@ghjk");
  process.exit(0);
}

seedBlockAdmin().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});