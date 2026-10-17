import express from "express";
import sequelize from "./config/db.js";

console.log("Starting test...");

try {
    await sequelize.authenticate();
    console.log("database connected");
} catch (error) {
    console.log("connection error", error);
}

console.log("Test complete");
