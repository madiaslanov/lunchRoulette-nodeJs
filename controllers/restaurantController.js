import db from "../config/db.js";

export const createRestaurant = async (req, res) => {
    const { name, rating, address, cuisine, price_range, wait_time, avg_price_range, seats, wifi, music, kids_friendly, parking, working_hours, latitude, longitude } = req.body;

    try {
        const result = await db.query(
            `INSERT INTO places (name, rating, address, cuisine, price_range, wait_time, avg_price_range, seats, wifi, music, kids_friendly, parking, working_hours, latitude, longitude)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
            [name, rating, address, cuisine, price_range, wait_time, avg_price_range, seats, wifi, music, kids_friendly, parking, working_hours, latitude, longitude]
        );

        res.status(201).json({ message: 'Ресторан добавлен', restaurant: result.rows[0] });
    } catch (err) {
        console.error('Ошибка добавления ресторана:', err);
        res.status(500).json({ error: 'Не удалось добавить ресторан' });
    }
};

// READ: Получение всех ресторанов
export const getRestaurants = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM places');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Ошибка получения ресторанов:', err);
        res.status(500).json({ error: 'Не удалось получить рестораны' });
    }
};

// READ: Получение одного ресторана по id
export const getRestaurantById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('SELECT * FROM places WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Ресторан не найден' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка получения ресторана по id:', err);
        res.status(500).json({ error: 'Не удалось получить ресторан' });
    }
};

// UPDATE: Обновление данных ресторана
export const updateRestaurant = async (req, res) => {
    const { id } = req.params;
    const { name, rating, address, cuisine, price_range, wait_time, avg_price_range, seats, wifi, music, kids_friendly, parking, working_hours, latitude, longitude } = req.body;

    try {
        const result = await db.query(
            `UPDATE places
            SET name = $1, rating = $2, address = $3, cuisine = $4, price_range = $5, wait_time = $6, avg_price_range = $7, seats = $8, wifi = $9, music = $10, kids_friendly = $11, parking = $12, working_hours = $13, latitude = $14, longitude = $15
            WHERE id = $16
            RETURNING *`,
            [name, rating, address, cuisine, price_range, wait_time, avg_price_range, seats, wifi, music, kids_friendly, parking, working_hours, latitude, longitude, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Ресторан не найден' });
        }

        res.status(200).json({ message: 'Ресторан обновлен', restaurant: result.rows[0] });
    } catch (err) {
        console.error('Ошибка обновления ресторана:', err);
        res.status(500).json({ error: 'Не удалось обновить ресторан' });
    }
};

// DELETE: Удаление ресторана
export const deleteRestaurant = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('DELETE FROM places WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Ресторан не найден' });
        }

        res.status(200).json({ message: 'Ресторан удален' });
    } catch (err) {
        console.error('Ошибка удаления ресторана:', err);
        res.status(500).json({ error: 'Не удалось удалить ресторан' });
    }
};