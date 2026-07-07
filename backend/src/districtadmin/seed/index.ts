import { connectDatabase } from "../../config/database";
import { SchoolPerformance } from "../../stateadmin/models/SchoolPerformance";
import { Notification } from "../models/Notification";

const DISTRICT = "Pune";
const STATE = "Maharashtra";

const STAGES = ["assessment_conducted", "uploaded", "scanning", "evaluation", "outcomes", "certified"] as const;

const BLOCKS = [
  {
    name: "Haveli",
    schools: [
      { name: "Pune Govt School A", suffix: "01", stage: "certified", students: 180, teachers: 5, volunteers: 3 },
      { name: "Pune Govt School B", suffix: "02", stage: "evaluation", students: 150, teachers: 4, volunteers: 2 },
      { name: "Pune Govt School C", suffix: "03", stage: "uploaded", students: 200, teachers: 6, volunteers: 4 },
    ],
  },
  {
    name: "Mulshi",
    schools: [
      { name: "Pune Govt School D", suffix: "04", stage: "scanning", students: 120, teachers: 3, volunteers: 2 },
      { name: "Pune Govt School E", suffix: "05", stage: "outcomes", students: 160, teachers: 5, volunteers: 3 },
      { name: "Pune Govt School F", suffix: "06", stage: "assessment_conducted", students: 90, teachers: 3, volunteers: 1 },
    ],
  },
  {
    name: "Khed",
    schools: [
      { name: "Pune Govt School G", suffix: "07", stage: "evaluation", students: 140, teachers: 4, volunteers: 2 },
      { name: "Pune Govt School H", suffix: "08", stage: "certified", students: 220, teachers: 7, volunteers: 5 },
      { name: "Pune Govt School I", suffix: "09", stage: null, students: 100, teachers: 3, volunteers: 2 },
    ],
  },
];

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function seedDistrictAdmin(): Promise<void> {
  await connectDatabase();

  await SchoolPerformance.deleteMany({ district: DISTRICT });
  await Notification.deleteMany({ district: DISTRICT });

  const performanceRows: any[] = [];

  for (const block of BLOCKS) {
    for (const school of block.schools) {
      const baseCert = school.stage === "certified" ? 75 + Math.floor(Math.random() * 20)
        : school.stage === "outcomes" ? 55 + Math.floor(Math.random() * 15)
        : school.stage === "evaluation" ? 35 + Math.floor(Math.random() * 20)
        : school.stage === "scanning" ? 25 + Math.floor(Math.random() * 15)
        : school.stage === "uploaded" ? 15 + Math.floor(Math.random() * 15)
        : school.stage === "assessment_conducted" ? 5 + Math.floor(Math.random() * 15)
        : Math.floor(Math.random() * 10);

      const certification = Math.min(100, baseCert);
      const completion = Math.min(100, certification + Math.floor(Math.random() * 25));
      const readingScore = Math.max(20, Math.round(certification * 0.8 + Math.random() * 10));
      const mathScore = Math.max(20, Math.round(readingScore * 0.9 + Math.random() * 10));

      const daysInStage = school.stage === "assessment_conducted" ? 12
        : school.stage === "uploaded" ? 9
        : school.stage === "scanning" ? 5
        : school.stage === "evaluation" ? 15
        : school.stage === "outcomes" ? 3
        : Math.floor(Math.random() * 30);

      performanceRows.push({
        state: STATE,
        district: DISTRICT,
        block: block.name,
        school: school.name,
        schoolId: `MH-PUN-${school.suffix}`,
        totalStudents: school.students,
        totalTeachers: school.teachers,
        totalVolunteers: school.volunteers,
        assessmentCompletion: completion,
        flnCertification: certification,
        readingScore,
        mathScore,
        completionStatus:
          certification >= 60 ? "complete"
          : certification >= 40 ? "in_progress"
          : certification >= 20 ? "pending"
          : "pending",
        pipelineStage: school.stage,
        pipelineEnteredAt: school.stage ? daysAgo(daysInStage) : null,
        infrastructureRequests: Math.floor(Math.random() * 3),
        lastUpdated: daysAgo(Math.floor(Math.random() * 5)),
      });
    }
  }

  await SchoolPerformance.insertMany(performanceRows);
  console.log(`${performanceRows.length} school performance records seeded for ${DISTRICT}`);

  const notifications: any[] = [];
  const bottleneckSchools = performanceRows.filter(
    (p: any) => p.pipelineStage && p.pipelineStage !== "certified" && p.pipelineEnteredAt
  );

  for (const s of bottleneckSchools) {
    const daysSince = Math.floor((Date.now() - new Date(s.pipelineEnteredAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince >= 14) {
      notifications.push({
        district: DISTRICT,
        block: s.block,
        type: "bottleneck",
        title: `Critical Bottleneck: ${s.school}`,
        message: `${s.school} has been in "${s.pipelineStage}" stage for ${daysSince} days. Immediate attention required.`,
        severity: "critical",
        read: false,
      });
    } else if (daysSince >= 7) {
      notifications.push({
        district: DISTRICT,
        block: s.block,
        type: "bottleneck",
        title: `Delayed Pipeline: ${s.school}`,
        message: `${s.school} has been in "${s.pipelineStage}" stage for ${daysSince} days.`,
        severity: "warning",
        read: false,
      });
    }
  }

  notifications.push({
    district: DISTRICT,
    type: "milestone",
    title: "Monthly Report Ready",
    message: "The monthly performance report for Pune district is now available.",
    severity: "info",
    read: false,
  });

  notifications.push({
    district: DISTRICT,
    type: "milestone",
    title: "Certification Milestone",
    message: "Pune Govt School H has achieved FLN certification.",
    severity: "info",
    read: true,
  });

  await Notification.insertMany(notifications);
  console.log(`${notifications.length} notifications seeded`);

  console.log("\n=== District Admin Seed Complete ===");
  console.log("District: Pune");
  console.log("Login at: http://localhost:5173");
  console.log("Email: district@fln.gov.in");
  console.log("Password: asdf@ghjk");
  process.exit(0);
}

seedDistrictAdmin().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
