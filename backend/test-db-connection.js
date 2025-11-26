import sequelize from "./config/db.js";

console.log("Testing database connection...");

try {
    await sequelize.authenticate();
    console.log("✓ Database connected successfully");
} catch (error) {
    console.error("✗ Database connection failed:", error.message);
}

console.log("Test complete");
process.exit(0);
