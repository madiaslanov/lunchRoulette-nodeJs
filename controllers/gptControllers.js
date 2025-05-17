import dotenv from "dotenv";
import { generateGptRecommendation } from "../service/gptService.js";

dotenv.config();

export const gptResponse = async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        const { reply } = await generateGptRecommendation(prompt, process.env.OPENROUTER_API_KEY);
        res.status(200).json({ reply });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Something went wrong" });
    }
};
