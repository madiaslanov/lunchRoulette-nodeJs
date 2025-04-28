import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();


const response = await gpt.responses.create({
    model: "gpt-4.1",
    input: "Write a one-sentence bedtime story about a unicorn.",
});

const gptResponse = async (prompt)=> {
    const response = await gpt.responses.create({
        model: "gpt-4.1",
        input: prompt
    });
    return response.text;
}


app.post( async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
        });

        const reply = response.choices[0]?.message?.content || "No response";

        res.status(200).json({ reply });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Something went wrong" });
    }
});