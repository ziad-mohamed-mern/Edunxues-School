import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.ts";
import { connectDB } from "./config/db.ts";

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = "admin@edunexus.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin user already exists.");
      process.exit(0);
    }

    const admin = await User.create({
      name: "System Admin",
      email: adminEmail,
      password: " ", // User should change this
      role: "admin",
      isActive: true,
    });

    console.log("✅ Admin user created successfully!");
    console.log(`Email: ${adminEmail}`);
    console.log("Password: password123");
    
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error seeding admin: ${(error as Error).message}`);
    process.exit(1);
  }
};

seedAdmin();
