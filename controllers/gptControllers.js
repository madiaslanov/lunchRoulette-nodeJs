import OpenAI from "openai";
import dotenv from "dotenv";
import client from "../config/db.js";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.GPT_KEY,
});

export const gptResponse = async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        let budget = 5000;
        const match = prompt.match(/(\d+)\s*тенг[е|и]/i);
        if (match) {
            budget = parseInt(match[1]);
        }

        console.log(`Найден бюджет из запроса: ${budget}₸`);

        const { rows: places } = await client.query(
            `
      SELECT id, name, address, cuisine, price_range, rating
      FROM places
      WHERE avg_price_range <= $1
      ORDER BY rating DESC
      LIMIT 5
      `,
            [budget]
        );

        if (places.length === 0) {
            return res.status(200).json({ reply: "Не найдено подходящих ресторанов для вашего бюджета." });
        }

        const placeList = places
            .map(
                (p, index) =>
                    `${index + 1}. ${p.name} (${p.cuisine}), ${p.address}, средний чек: ${p.price_range}₸, рейтинг: ${p.rating}`
            )
            .join("\n");

        const fullPrompt = `
    Пользователь интересуется, где можно поесть в пределах ${budget}₸. 
    Вот рестораны, которые мы нашли в базе данных:

    ${placeList}

    На основе этого списка порекомендуй 1-2 ресторана в дружелюбной и понятной форме.
    Не выдумывай свои варианты, используй только предложенные рестораны.
    `;

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: fullPrompt }],
        });

        const reply = response.choices[0]?.message?.content || "No response";

        return res.status(200).json({ reply });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message || "Something went wrong" });
    }
};
