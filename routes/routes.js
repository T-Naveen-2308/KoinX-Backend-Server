import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import { getStatistics, getDeviation } from "../controllers/controllers.js";

const mainApp = Router();

mainApp.get("/stats", expressAsyncHandler(getStatistics));

export default mainApp;
