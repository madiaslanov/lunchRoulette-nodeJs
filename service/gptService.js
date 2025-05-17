import fetch from "node-fetch";
import { getPlacesByBudget } from "../repository/gptRepository.js";

export const generateGptRecommendation = async (promptText, apiKey) => {
    let budget = 5000;
    const match = promptText.match(/(\d+)\s*тенг[е|и]/i);
    if (match) {
        budget = parseInt(match[1]);
    }

    console.log(`Найден бюджет из запроса: ${budget}₸`);

    const places = await getPlacesByBudget(budget);

    if (places.length === 0) {
        return {
            reply: "Не найдено подходящих ресторанов для вашего бюджета.",
        };
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
            Authorization: `Bearer ${apiKey}`,
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
    const reply = data.choices?.[0]?.message?.content || "Нет ответа";

    return { reply };
};
