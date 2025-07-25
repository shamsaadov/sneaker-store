const db = require("../config/database");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    console.log("Starting admin user creation...");

    // Initialize database
    await db.init();

    // Admin user data
    const adminData = {
      email: "admin@sneakerstore.com",
      password: "admin123",
      name: "Администратор",
      role: "admin",
    };

    // Check if admin already exists
    const existingAdmin = await User.findByEmail(adminData.email);
    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log("Email:", existingAdmin.email);
      console.log("Name:", existingAdmin.name);
      console.log("Role:", existingAdmin.role);
      return;
    }

    // Create admin user
    console.log("Creating admin user...");
    const admin = await User.create(adminData);

    console.log("Admin user created successfully!");
    console.log("Email:", admin.email);
    console.log("Name:", admin.name);
    console.log("Role:", admin.role);
    console.log("ID:", admin.id);

    console.log("\nYou can now login with:");
    console.log("Email: admin@sneakerstore.com");
    console.log("Password: admin123");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    process.exit(0);
  }
};

// Run if called directly
if (require.main === module) {
  createAdmin();
}

module.exports = createAdmin;
