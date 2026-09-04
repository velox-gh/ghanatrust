import dotenv from "dotenv";
dotenv.config();

// Secrets with no safe default. Missing values here don't fail loudly on their
// own — `jwt.verify(token, undefined)` and an undefined session secret both
// degrade quietly into broken or insecure auth — so the process refuses to
// start instead.
const REQUIRED = ["JWT_SECRET", "SESSION_SECRET"];

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length) {
    console.error(
        `
FATAL: missing required environment variable(s): ${missing.join(", ")}
` +
        `Copy server/.env.example to server/.env and set them before starting.
`
    );
    process.exit(1);
}

export const config = {
    port: process.env.PORT || 5000,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE || "7d",
    sessionSecret: process.env.SESSION_SECRET,
    dbHost: process.env.DB_HOST,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    nodeEnv: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",
};
