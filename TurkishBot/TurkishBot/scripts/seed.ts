import { db } from "../server/db";
import { users } from "../shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Hash passwords
    const saltRounds = 12;
    const adminPassword = await bcrypt.hash("123456", saltRounds);
    const sellerPassword = await bcrypt.hash("123456", saltRounds);
    const buyerPassword = await bcrypt.hash("123456", saltRounds);

    // Clear existing users
    await db.delete(users);
    console.log("🗑️  Cleared existing users");

    // Create admin user
    await db.insert(users).values({
      email: "admin@example.com",
      password_hash: adminPassword,
      first_name: "Admin",
      last_name: "User",
      role: "ADMIN",
      company: "Sistem Yönetimi",
      notify_email: true,
      notify_inapp: true,
    });

    // Create seller user
    await db.insert(users).values({
      email: "ayse@firma.com",
      password_hash: sellerPassword,
      first_name: "Ayşe",
      last_name: "Yılmaz",
      role: "SELLER",
      company: "ABC Şirketi",
      phone: "+90 532 123 45 67",
      notify_email: true,
      notify_inapp: true,
    });

    // Create buyer user
    await db.insert(users).values({
      email: "mehmet@firma.com",
      password_hash: buyerPassword,
      first_name: "Mehmet",
      last_name: "Kaya",
      role: "BUYER",
      company: "XYZ Ltd.",
      phone: "+90 535 987 65 43",
      notify_email: false,
      notify_inapp: true,
    });

    console.log("✅ Seed completed successfully!");
    console.log("📋 Created users:");
    console.log("   - admin@example.com (password: 123456) - ADMIN");
    console.log("   - ayse@firma.com (password: 123456) - SELLER");
    console.log("   - mehmet@firma.com (password: 123456) - BUYER");

  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log("🎉 Seeding process completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seeding process failed:", error);
    process.exit(1);
  });
