import { connectDatabase } from "../config/database";
import { User } from "../models/User";
import { AssessmentCalendar } from "./models/AssessmentCalendar";
import { Curriculum } from "./models/Curriculum";
import { QuestionReview } from "./models/QuestionReview";
import { Feedback } from "./models/Feedback";
import { Announcement } from "./models/Announcement";
import { VisualAsset } from "./models/VisualAsset";

async function seedSuperadmin(): Promise<void> {
  await connectDatabase();

  const nationalAdmin = await User.findOne({ role: "national_admin" });
  if (!nationalAdmin) {
    console.error("National admin user not found. Run main seed first.");
    process.exit(1);
  }

  await AssessmentCalendar.deleteMany({});
  await Curriculum.deleteMany({});
  await QuestionReview.deleteMany({});
  await Feedback.deleteMany({});
  await Announcement.deleteMany({});
  await VisualAsset.deleteMany({});

  const currentYear = new Date().getFullYear();
  const academicYear = `${currentYear}-${(currentYear + 1) % 100}`;

  await AssessmentCalendar.insertMany([
    {
      cycle: "baseline",
      academicYear,
      label: `Baseline Assessment ${academicYear}`,
      description: "Initial assessment to gauge learning levels",
      startDate: new Date(`${currentYear}-04-15`),
      endDate: new Date(`${currentYear}-05-15`),
      resultDate: new Date(`${currentYear}-06-01`),
      status: "published",
      isActive: true,
      createdBy: nationalAdmin._id,
    },
    {
      cycle: "mid-year",
      academicYear,
      label: `Mid-Year Assessment ${academicYear}`,
      description: "Mid-year progress evaluation",
      startDate: new Date(`${currentYear}-10-01`),
      endDate: new Date(`${currentYear}-11-01`),
      resultDate: new Date(`${currentYear}-11-30`),
      status: "published",
      isActive: true,
      createdBy: nationalAdmin._id,
    },
    {
      cycle: "end-of-year",
      academicYear,
      label: `End-of-Year Assessment ${academicYear}`,
      description: "Final year assessment",
      startDate: new Date(`${currentYear + 1}-02-01`),
      endDate: new Date(`${currentYear + 1}-03-15`),
      resultDate: new Date(`${currentYear + 1}-04-01`),
      status: "draft",
      isActive: true,
      createdBy: nationalAdmin._id,
    },
  ]);
  console.log("Assessment calendars seeded");

  const mathCurriculum = `# Mathematics Curriculum - Grade 3

## Overview
This curriculum covers foundational numeracy skills for Grade 3 students.

## Learning Outcomes
- Students can perform basic addition and subtraction
- Students understand place value
- Students can read and interpret simple charts
- Students can solve word problems

## Competencies
- Number sense
- Operations
- Measurement
- Data interpretation

## Units

### Unit 1: Number Systems
- Place value (ones, tens, hundreds)
- Comparing numbers
- Rounding

### Unit 2: Operations
- Addition with regrouping
- Subtraction with borrowing
- Multiplication tables
- Introduction to division

### Unit 3: Measurement
- Length (cm, m)
- Weight (g, kg)
- Time
- Money

### Unit 4: Data
- Reading bar graphs
- Simple pictographs
- Tally marks

## Assessment Approach
- Formative assessments every two weeks
- Summative assessment at end of each unit
- Cumulative assessment at year end
`;

  await Curriculum.create({
    title: "Mathematics Grade 3",
    subject: "Mathematics",
    grade: "3",
    language: "English",
    content: mathCurriculum,
    status: "published",
    currentVersion: 1,
    learningOutcomes: [
      "Students can perform basic addition and subtraction",
      "Students understand place value",
      "Students can read and interpret simple charts",
    ],
    competencies: ["Number sense", "Operations", "Measurement", "Data interpretation"],
    versions: [{
      version: 1,
      content: mathCurriculum,
      author: nationalAdmin.name,
      authorId: nationalAdmin._id,
      notes: "Initial version",
      createdAt: new Date(),
    }],
    createdBy: nationalAdmin._id,
  });
  console.log("Curricula seeded");

  await QuestionReview.insertMany([
    {
      questionId: "Q-MATH-3-001",
      questionText: "What is 25 + 17?",
      subject: "Mathematics",
      grade: "3",
      difficulty: "easy",
      failureRate: 62.5,
      totalAttempts: 1240,
      correctAttempts: 465,
      flagReason: "High failure rate on easy question",
      recommendation: "Review language clarity - translation may be confusing",
      status: "pending",
      notes: "",
      createdBy: nationalAdmin._id,
    },
    {
      questionId: "Q-HINDI-3-005",
      questionText: "Choose the correct plural form of 'किताब' (book)",
      subject: "Hindi",
      grade: "3",
      difficulty: "easy",
      failureRate: 71.3,
      totalAttempts: 980,
      correctAttempts: 281,
      flagReason: "High failure rate on easy question",
      recommendation: "Plural rules may need additional teaching support",
      status: "pending",
      notes: "",
      createdBy: nationalAdmin._id,
    },
    {
      questionId: "Q-ENG-2-010",
      questionText: "Identify the noun in: 'The cat sat on the mat.'",
      subject: "English",
      grade: "2",
      difficulty: "easy",
      failureRate: 55.8,
      totalAttempts: 1520,
      correctAttempts: 672,
      status: "pending",
      notes: "",
      createdBy: nationalAdmin._id,
    },
  ]);
  console.log("Question reviews seeded");

  await Feedback.insertMany([
    {
      title: "Translation issue in Hindi question paper",
      description: "Several questions in Hindi medium have incorrect translations causing student confusion.",
      category: "translation",
      priority: "high",
      source: "teacher",
      sourceUser: { name: "Ramesh Kumar", email: "teacher@fln.gov.in", role: "teacher" },
      status: "open",
      resolution: "",
      duplicateOf: null,
      createdBy: nationalAdmin._id,
    },
    {
      title: "App crashes on slow internet",
      description: "When students try to upload assessment results on 2G connections, the app crashes.",
      category: "technical",
      priority: "urgent",
      source: "district_officer",
      sourceUser: { name: "Priya Patel", email: "district@fln.gov.in", role: "district_officer" },
      status: "in_progress",
      resolution: "",
      duplicateOf: null,
      createdBy: nationalAdmin._id,
    },
    {
      title: "Suggestion for offline mode",
      description: "Please add offline mode for teachers working in remote areas with no connectivity.",
      category: "suggestion",
      priority: "medium",
      source: "volunteer",
      sourceUser: { name: "Amit Singh", email: "volunteer@fln.gov.in", role: "volunteer" },
      status: "open",
      resolution: "",
      duplicateOf: null,
      createdBy: nationalAdmin._id,
    },
    {
      title: "Math curriculum Grade 2 too advanced",
      description: "Some teachers report the Grade 2 math curriculum is too advanced for average students.",
      category: "curriculum",
      priority: "medium",
      source: "principal",
      sourceUser: { name: "Sita Devi", email: "principal@fln.gov.in", role: "principal" },
      status: "open",
      resolution: "",
      duplicateOf: null,
      createdBy: nationalAdmin._id,
    },
    {
      title: "Add more visual aids for reading assessment",
      description: "Reading assessment would benefit from more visual aids especially for early grades.",
      category: "assessment",
      priority: "low",
      source: "state_officer",
      sourceUser: { name: "Sunil Verma", email: "state@fln.gov.in", role: "state_officer" },
      status: "resolved",
      resolution: "Added 50 new illustrations to visual library",
      duplicateOf: null,
      createdBy: nationalAdmin._id,
    },
  ]);
  console.log("Feedback seeded");

  await Announcement.insertMany([
    {
      title: "Baseline Assessment 2026-27 Begins April 15",
      content: `# Baseline Assessment Schedule

The national baseline assessment for academic year **2026-27** will commence on **April 15**.

All schools are required to:
- Complete the assessment within the scheduled window
- Upload results by end of the assessment period
- Report any technical issues immediately

For support, contact your block officer.`,
      type: "info",
      status: "published",
      targetAudience: { allIndia: true, states: [], districts: [], blocks: [], schools: [], roles: [] },
      scheduledAt: null,
      publishedAt: new Date(),
      sendEmail: true,
      createdBy: nationalAdmin._id,
    },
    {
      title: "URGENT: Server Maintenance Tonight",
      content: `The platform will be undergoing maintenance tonight from **11 PM to 2 AM IST**.

Please save your work and log out before this time. Assessment uploads scheduled during this window will be queued and processed after maintenance.`,
      type: "urgent",
      status: "published",
      targetAudience: { allIndia: true, states: [], districts: [], blocks: [], schools: [], roles: [] },
      scheduledAt: null,
      publishedAt: new Date(),
      sendEmail: true,
      createdBy: nationalAdmin._id,
    },
    {
      title: "New Curriculum Version Available",
      content: `A new version of the Grade 3 Mathematics curriculum has been published. Teachers are encouraged to review the updated learning outcomes and assessment approach.`,
      type: "update",
      status: "published",
      targetAudience: { allIndia: false, states: [], districts: [], blocks: [], schools: [], roles: ["teacher", "principal"] },
      scheduledAt: null,
      publishedAt: new Date(),
      sendEmail: false,
      createdBy: nationalAdmin._id,
    },
  ]);
  console.log("Announcements seeded");

  await VisualAsset.insertMany([
    {
      title: "Number Line Illustration",
      description: "Colorful number line for Grade 1-3 math",
      url: "https://placehold.co/400x400/2563EB/FFFFFF/png?text=Number+Line",
      type: "illustration",
      tags: { subjects: ["Mathematics"], grades: ["1", "2", "3"], languages: ["English", "Hindi"] },
      currentVersion: 1,
      versions: [{ version: 1, url: "https://placehold.co/400x400/2563EB/FFFFFF/png?text=Number+Line", uploadedAt: new Date(), uploadedBy: nationalAdmin.name }],
      fileSize: 0,
      mimeType: "image/png",
      isActive: true,
      createdBy: nationalAdmin._id,
    },
    {
      title: "Reading Book Icon",
      description: "Icon representing reading activity",
      url: "https://placehold.co/200x200/10B981/FFFFFF/png?text=Reading",
      type: "icon",
      tags: { subjects: ["English", "Hindi"], grades: ["1", "2", "3", "4", "5"], languages: ["English"] },
      currentVersion: 1,
      versions: [{ version: 1, url: "https://placehold.co/200x200/10B981/FFFFFF/png?text=Reading", uploadedAt: new Date(), uploadedBy: nationalAdmin.name }],
      fileSize: 0,
      mimeType: "image/png",
      isActive: true,
      createdBy: nationalAdmin._id,
    },
    {
      title: "Apple Counting Image",
      description: "Image of 5 apples for counting exercise",
      url: "https://placehold.co/400x400/EF4444/FFFFFF/png?text=5+Apples",
      type: "image",
      tags: { subjects: ["Mathematics"], grades: ["1", "2"], languages: ["English", "Hindi"] },
      currentVersion: 1,
      versions: [{ version: 1, url: "https://placehold.co/400x400/EF4444/FFFFFF/png?text=5+Apples", uploadedAt: new Date(), uploadedBy: nationalAdmin.name }],
      fileSize: 0,
      mimeType: "image/png",
      isActive: true,
      createdBy: nationalAdmin._id,
    },
    {
      title: "Hindi Vowels Chart",
      description: "Hindi vowels chart with pronunciation",
      url: "https://placehold.co/600x400/F59E0B/FFFFFF/png?text=Hindi+Vowels",
      type: "illustration",
      tags: { subjects: ["Hindi"], grades: ["1", "2", "3"], languages: ["Hindi"] },
      currentVersion: 1,
      versions: [{ version: 1, url: "https://placehold.co/600x400/F59E0B/FFFFFF/png?text=Hindi+Vowels", uploadedAt: new Date(), uploadedBy: nationalAdmin.name }],
      fileSize: 0,
      mimeType: "image/png",
      isActive: true,
      createdBy: nationalAdmin._id,
    },
  ]);
  console.log("Visual assets seeded");

  console.log("\n=== Superadmin Seed Complete ===");
  console.log("Login at: http://localhost:5173");
  console.log("Email: national@fln.gov.in");
  console.log("Password: password123");
  process.exit(0);
}

seedSuperadmin().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});