import { connectDatabase } from "./config/database";
import { User } from "./models/User";
import { Admin } from "./superadmin/models/Admin";
import bcrypt from "bcryptjs";

const NEW_PASSWORD = "asdf@ghjk";

async function resetPasswords(): Promise<void> {
  await connectDatabase();

  const salt = await bcrypt.genSalt(12);
  const hashed = await bcrypt.hash(NEW_PASSWORD, salt);

  const userResult = await User.updateMany({}, { password: hashed });
  const adminResult = await Admin.updateMany({}, { password: hashed });

  console.log(`Users updated: ${userResult.modifiedCount}`);
  console.log(`Admins updated: ${adminResult.modifiedCount}`);
  console.log(`New password: ${NEW_PASSWORD}`);
  process.exit(0);
}

resetPasswords().catch((err) => {
  console.error("Password reset failed:", err);
  process.exit(1);
});