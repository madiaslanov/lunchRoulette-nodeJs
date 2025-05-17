import client from "../config/db.js";

export const getPlacesByBudget = async (budget) => {
    const query = `
        SELECT id, name, address, cuisine, price_range, rating
        FROM places
        WHERE avg_price_range <= $1
        ORDER BY rating DESC
        LIMIT 5
    `;
    const result = await client.query(query, [budget]);
    return result.rows;
};
