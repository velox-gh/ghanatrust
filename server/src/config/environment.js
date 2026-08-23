import dotenv from "dotenv";
dotenv.config();

export const config = {
    port: process.env.PORT || 5000,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE || "7d",
    dbHost: process.env.DB_HOST,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    nodeEnv: process.env.NODE_ENV || "development",
};