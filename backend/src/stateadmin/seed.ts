import { connectDatabase } from "../config/database";
import { User } from "../models/User";
import { SchoolPerformance } from "./models/SchoolPerformance";
import { InfrastructureRequest } from "./models/InfrastructureRequest";

const MAHARASHTRA = "Maharashtra";

const DISTRICTS = [
  { name: "Pune", blocks: ["Haveli", "Junnar", "Baramati"] },
  { name: "Mumbai", blocks: ["Andheri", "Borivali", "Kurla"] },
  { name: "Nagpur", blocks: ["Nagpur Urban", "Nagpur Rural", "Kamptee"] },
  { name: "Nashik", blocks: ["Nashik City", "Sinnar", "Igatpuri"] },
  { name: "Aurangabad", blocks: ["Aurangabad City", "Paithan", "Vaijapur"] },
  { name: "Kolhapur", blocks: ["Karveer", "Panhala", "Shahuwadi"] },
  { name: "Satara", blocks: ["Satara City", "Koregaon", "Wai"] },
];

async function seedStateAdmin(): Promise<void> {
  await connectDatabase();

  // 1) Find existing state admin for Maharashtra
  const stateAdmin = await User.findOne({ role: "state_admin", assignedState: MAHARASHTRA });
  if (!stateAdmin) {
    console.error("Maharashtra state admin not found. Run main seed first.");
    process.exit(1);
  }

  // 2) Clear existing state-admin-scoped demo data
  await SchoolPerformance.deleteMany({ state: MAHARASHTRA });
  await InfrastructureRequest.deleteMany({ state: MAHARASHTRA });
  await User.deleteMany({
    state: MAHARASHTRA,
    role: { $in: ["district_officer", "block_officer", "teacher", "principal", "volunteer"] },
  });

  let empCounter = 5000;

  // 3) Create district admins (one per district)
  const districtAdminIds: Record<string, any> = {};
  for (const d of DISTRICTS) {
    empCounter++;
    const admin = await User.create({
      name: `${d.name} District Admin`,
      email: `da.${d.name.toLowerCase()}@fln.gov.in`,
      employeeId: `DA${empCounter}`,
      password: "asdf@ghjk",
      role: "district_officer",
      state: MAHARASHTRA,
      district: d.name,
      assignedDistrict: d.name,
      assignedState: MAHARASHTRA,
    });
    districtAdminIds[d.name] = admin._id;
  }
  console.log("District admins seeded");

  // 4) Create schools (3-5 per district) with principals, performance records
  const performanceRows: any[] = [];
  const infrastructureRows: any[] = [];

  for (const d of DISTRICTS) {
    const districtAvgBase = Math.random() * 40 + 30; // 30-70 base avg
    const numSchools = 3 + Math.floor(Math.random() * 3); // 3-5 schools

    for (let i = 0; i < numSchools; i++) {
      const block = d.blocks[i % d.blocks.length];
      const suffix = String.fromCharCode(65 + i);
      const schoolName = `${d.name} Govt School ${suffix}`;
      const schoolId = `MH-${d.name.substring(0, 3).toUpperCase()}-${i + 1}`;

      // Create principal
      empCounter++;
      const principal = await User.create({
        name: `${d.name} Principal ${i + 1}`,
        email: `principal.${d.name.toLowerCase()}.${i + 1}@fln.gov.in`,
        employeeId: `PRN${empCounter}`,
        password: "asdf@ghjk",
        role: "principal",
        state: MAHARASHTRA,
        district: d.name,
        block,
        school: schoolName,
        isActive: i === 2 && d.name === "Aurangabad" ? false : true, // Lock one school
        lockReason: i === 2 && d.name === "Aurangabad" ? "Too many failed login attempts" : "",
        lockedAt: i === 2 && d.name === "Aurangabad" ? new Date() : null,
        failedLoginAttempts: i === 2 && d.name === "Aurangabad" ? 5 : 0,
      });

      // Create 2-3 teachers per school
      const numTeachers = 2 + Math.floor(Math.random() * 2);
      for (let t = 0; t < numTeachers; t++) {
        empCounter++;
        await User.create({
          name: `Teacher ${d.name}-${i + 1}-${t + 1}`,
          email: `teacher.${d.name.toLowerCase()}.${i + 1}.${t + 1}@fln.gov.in`,
          employeeId: `TCH${empCounter}`,
          password: "asdf@ghjk",
          role: "teacher",
          state: MAHARASHTRA,
          district: d.name,
          block,
          school: schoolName,
        });
      }

      // Create 1-2 volunteers per school
      const numVolunteers = 1 + Math.floor(Math.random() * 2);
      for (let v = 0; v < numVolunteers; v++) {
        empCounter++;
        await User.create({
          name: `Volunteer ${d.name}-${i + 1}-${v + 1}`,
          email: `vol.${d.name.toLowerCase()}.${i + 1}.${v + 1}@fln.gov.in`,
          employeeId: `VOL${empCounter}`,
          password: "asdf@ghjk",
          role: "volunteer",
          state: MAHARASHTRA,
          district: d.name,
          block,
          school: schoolName,
        });
      }

      // Create school performance
      const totalStudents = 80 + Math.floor(Math.random() * 200);
      const totalTeachers = numTeachers;
      const totalVolunteers = numVolunteers;
      const districtCert = Math.max(15, Math.min(85, districtAvgBase + (Math.random() * 30 - 15)));
      const certification = i === 2 && d.name === "Aurangabad" ? 18 : Math.round(districtCert + (Math.random() * 20 - 10));
      const completion = Math.min(100, certification + Math.round(Math.random() * 30));
      const readingScore = Math.max(20, Math.round(certification + (Math.random() * 10 - 5)));
      const mathScore = Math.max(20, Math.round(readingScore + (Math.random() * 10 - 5)));

      performanceRows.push({
        state: MAHARASHTRA,
        district: d.name,
        block,
        school: schoolName,
        schoolId,
        totalStudents,
        totalTeachers,
        totalVolunteers,
        assessmentCompletion: completion,
        flnCertification: certification,
        readingScore,
        mathScore,
        completionStatus:
          certification >= 60 ? "complete"
          : certification >= 40 ? "in_progress"
          : "pending",
        infrastructureRequests: Math.floor(Math.random() * 3),
        lastUpdated: new Date(),
      });

      // Create 0-2 infrastructure requests per school
      if (Math.random() < 0.4) {
        const categories: any[] = ["electricity", "internet", "devices", "furniture", "washroom"];
        infrastructureRows.push({
          title: `Need ${categories[Math.floor(Math.random() * 5)]} for ${schoolName}`,
          description: "Urgent requirement to support FLN assessment.",
          category: categories[Math.floor(Math.random() * categories.length)],
          priority: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
          state: MAHARASHTRA,
          district: d.name,
          block,
          school: schoolName,
          reportedBy: principal.name,
          reportedByEmail: principal.email,
          status: ["pending", "approved", "in_progress"][Math.floor(Math.random() * 3)],
          resolution: "",
          resolvedAt: null,
        });
      }
    }
  }

  await SchoolPerformance.insertMany(performanceRows);
  console.log(`${performanceRows.length} school performance records seeded`);

  if (infrastructureRows.length) {
    await InfrastructureRequest.insertMany(infrastructureRows);
    console.log(`${infrastructureRows.length} infrastructure requests seeded`);
  }

  console.log("\n=== State Admin Seed Complete ===");
  console.log("State: Maharashtra");
  console.log("Login at: http://localhost:5173");
  console.log("Email: state@fln.gov.in");
  console.log("Password: asdf@ghjk");
  process.exit(0);
}

seedStateAdmin().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});