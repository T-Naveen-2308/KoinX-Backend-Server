import exp from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client/default.js";

dotenv.config();

const app = exp();
const prisma = new PrismaClient();

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`\nHTTP Server on Port ${port}`);
});