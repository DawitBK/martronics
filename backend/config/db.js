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
    DATABASE_URL,
    NODE_ENV = "development"
} = process.env;

let sequelize;

if (DATABASE_URL) {
    sequelize = new Sequelize(DATABASE_URL, {
        logging: false,
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false // Needed for some cloud providers with self-signed certs
            }
        }
    });
} else {
    if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USER || !DB_PASSWORD) {
        console.error("Missing required PostgreSQL environment variables.");
        console.error("Required: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD OR DATABASE_URL");
        process.exit(1);
    }

    const dbconf = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

    sequelize = new Sequelize(dbconf, {
        logging: false,
        dialect: "postgres",
        dialectOptions: {}
    });
}

export default sequelize;
