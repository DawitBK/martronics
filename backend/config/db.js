import { config } from 'dotenv';
import { Sequelize } from "sequelize";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root (one level up from backend)
config({ path: join(__dirname, '../.env') });

const {
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    NODE_ENV = "development"
} = process.env;

if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USER || !DB_PASSWORD) {
    console.error("Missing required PostgreSQL environment variables.");
    console.error("Required: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD");
    process.exit(1);
}

const dbconf = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

export const sequelize = new Sequelize(dbconf, {
    logging: false,
    dialect: "postgres",
    dialectOptions: {}
});

export default sequelize;
