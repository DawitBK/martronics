import { config } from 'dotenv';
import { Sequelize } from "sequelize";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

console.log("Step 1: Imports successful");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("Step 2: __dirname setup successful");

config({ path: join(__dirname, '.env') });

console.log("Step 3: dotenv config successful");

const {
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    DATABASE_URL
} = process.env;

console.log("Step 4: Environment variables loaded");
console.log("DB_HOST:", DB_HOST);
console.log("DATABASE_URL exists:", !!DATABASE_URL);

if (!DATABASE_URL && (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USER || !DB_PASSWORD)) {
    console.error("Missing required PostgreSQL environment variables.");
    process.exit(1);
}

console.log("Step 5: Creating Sequelize instance...");

const dbconf = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
const sequelize = new Sequelize(dbconf, {
    logging: false,
    dialect: "postgres",
    dialectOptions: {}
});

console.log("Step 6: Sequelize instance created successfully");
console.log("Test complete!");
