import { connectDatabase } from "./config/database";
import { User } from "./models/User";
import { Role } from "./models/Role";

const roles = [
  { name: "teacher", description: "Classroom teacher", permissions: ["view_students", "assess_students"] },
  { name: "principal", description: "School principal", permissions: ["view_students", "view_reports", "manage_teachers"] },
  { name: "volunteer", description: "Community volunteer", permissions: ["view_students"] },
  { name: "block_officer", description: "Block education officer", permissions: ["view_reports", "view_schools"] },
  { name: "district_officer", description: "District education officer", permissions: ["view_reports", "view_blocks", "manage_blocks"] },
  { name: "state_admin", description: "State administrator", permissions: ["view_reports", "view_districts", "manage_districts"] },
  { name: "national_admin", description: "National administrator", permissions: ["all"] },
];

const users = [
  { name: "Ramesh Kumar", email: "teacher@fln.gov.in", employeeId: "TCH001", password: "asdf@ghjk", role: "teacher" },
  { name: "Sita Devi", email: "principal@fln.gov.in", employeeId: "PRN001", password: "asdf@ghjk", role: "principal" },
  { name: "Amit Singh", email: "volunteer@fln.gov.in", employeeId: "VOL001", password: "asdf@ghjk", role: "volunteer" },
  { name: "Rajesh Block", email: "block.pune@fln.gov.in", employeeId: "BLK001", password: "asdf@ghjk", role: "block_officer", state: "Maharashtra", assignedState: "Maharashtra", district: "Pune", assignedDistrict: "Pune", block: "Haveli", assignedBlocks: ["Haveli"] },
  { name: "Suresh Block", email: "block.mulshi@fln.gov.in", employeeId: "BLK002", password: "asdf@ghjk", role: "block_officer", state: "Maharashtra", assignedState: "Maharashtra", district: "Pune", assignedDistrict: "Pune", block: "Mulshi", assignedBlocks: ["Mulshi"] },
  { name: "Anita Block", email: "block.khed@fln.gov.in", employeeId: "BLK003", password: "asdf@ghjk", role: "block_officer", state: "Maharashtra", assignedState: "Maharashtra", district: "Pune", assignedDistrict: "Pune", block: "Khed", assignedBlocks: ["Khed"] },
  { name: "Priya Patel", email: "district@fln.gov.in", employeeId: "DST001", password: "asdf@ghjk", role: "district_officer", assignedDistrict: "Pune" },
  { name: "Sunil Verma", email: "state@fln.gov.in", employeeId: "STT001", password: "asdf@ghjk", role: "state_admin", state: "Maharashtra", assignedState: "Maharashtra" },
  { name: "Kavita Singh", email: "state.karnataka@fln.gov.in", employeeId: "STT002", password: "asdf@ghjk", role: "state_admin", state: "Karnataka", assignedState: "Karnataka" },
  { name: "Anita Rao", email: "national@fln.gov.in", employeeId: "NAT001", password: "asdf@ghjk", role: "national_admin" },
];

async function seed(): Promise<void> {
  await connectDatabase();

  await Role.deleteMany({});
  await Role.insertMany(roles);
  console.log("Roles seeded");

  await User.deleteMany({});
  for (const userData of users) {
    const user = new User(userData);
    await user.save();
  }
  console.log("Users seeded");

  console.log("Seed complete");
  console.log("District Admin (Pune):");
  console.log("  district@fln.gov.in / asdf@ghjk -> assignedDistrict: Pune");
  console.log("State Admins:");
  console.log("  state@fln.gov.in / asdf@ghjk -> Maharashtra");
  console.log("  state.karnataka@fln.gov.in / asdf@ghjk -> Karnataka");
  console.log("");
  console.log("Next: Run 'npm run seed:districtadmin' to seed district + pipeline demo data");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});