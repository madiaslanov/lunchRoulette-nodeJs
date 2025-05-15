import dotenv from "dotenv";
import fetch from "node-fetch"; // Если у тебя Node.js v18+, fetch встроен, тогда импорт не нужен
import client from "../config/db.js";

dotenv.config();

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

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-prover-v2:free",
                messages: [
                    {
                        role: "user",
                        content: fullPrompt,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "No response";

        return res.status(200).json({ reply });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message || "Something went wrong" });
    }
};
