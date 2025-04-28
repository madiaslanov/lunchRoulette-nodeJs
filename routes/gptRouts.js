
import express from "express";
import {gptResponse} from "../controllers/gptControllers.js";

const router = express.Router();

// POST /api/v1/chat
router.post("/", gptResponse);

export default router;