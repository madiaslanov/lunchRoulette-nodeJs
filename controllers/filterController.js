import db from '../config/db.js';

export const filterAndFindNearbyPlaces = async (req, res) => {
    const { cuisine, rating, wait_time, lat, lon, radius = 2 } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ message: 'Пожалуйста, передайте параметры lat и lon' });
    }

    const radiusInKm = Number(radius);

    if (isNaN(radiusInKm) || radiusInKm <= 0) {
        return res.status(400).json({ message: 'Неверный радиус' });
    }

    let query = 'SELECT * FROM places WHERE 1=1';
    const params = [];

    if (cuisine) {
        params.push(`%${cuisine}%`);
        query += ` AND cuisine ILIKE $${params.length}`;
    }

    if (rating) {
        params.push(Number(rating));
        query += ` AND rating >= $${params.length}`;
    }

    if (wait_time) {
        params.push(Number(wait_time));
        query += ` AND wait_time <= $${params.length}`;
    }

    try {
        // Запрос фильтрованных данных
        const result = await db.query(query, params);
        const filteredPlaces = result.rows;

        // Если после фильтрации данных нет
        if (filteredPlaces.length === 0) {
            return res.status(404).json({ message: 'Ничего не найдено по фильтрам' });
        }

        const nearbyResult = await db.query(`
            SELECT id, name, address, cuisine, price_range, wait_time, rating, avg_price_range, seats, wifi, music,
                   kids_friendly, parking, working_hours, image_url, latitude, longitude,
                   ST_Distance(
                           ST_SetSRID(ST_MakePoint($2, $1), 4326),
                           ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
                   ) / 1000 AS distance_km
            FROM places
            WHERE ST_Distance(
                          ST_SetSRID(ST_MakePoint($2, $1), 4326),
                          ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
                  ) <= $3 * 1000  -- Применение радиуса
              AND id IN (${filteredPlaces.map((place, index) => `$${index + params.length + 1}`).join(', ')})
        `, [lat, lon, radiusInKm, ...filteredPlaces.map(place => place.id)]);

        const nearbyPlaces = nearbyResult.rows;

        if (nearbyPlaces.length === 0) {
            return res.status(404).json({ message: 'Ничего не найдено в этом радиусе' });
        }

        nearbyPlaces.sort((a, b) => a.distance_km - b.distance_km);

        // Возвращаем успешный ответ с результатами
        return res.json(nearbyPlaces);
    } catch (error) {
        console.error('Ошибка при поиске данных:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
};



export const searchPlaceByName = async (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ message: 'Пожалуйста, передайте параметр name для поиска' });
    }

    try {
        const result = await db.query(
            `SELECT * FROM places WHERE name ILIKE $1`,
            [`%${name}%`]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Рестораны с таким именем не найдены' });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Ошибка поиска ресторана по имени:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

export const getPlacesByRating = async (req, res) => {
    const { sort = 'id', order = 'asc' } = req.query;

    const validSortFields = ['id', 'name', 'rating', 'avg_price_range', 'wait_time'];
    const validOrders = ['asc', 'desc'];

    const sortField = validSortFields.includes(sort) ? sort : 'id';
    const sortOrder = validOrders.includes(order.toLowerCase()) ? order.toUpperCase() : 'ASC';

    try {
        const result = await db.query(
            `SELECT * FROM places ORDER BY ${sortField} ${sortOrder}`
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Ошибка при получении ресторанов:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

export const getPlaceById = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'Пожалуйста, передайте параметр id' });
    }

    try {

        const result = await db.query(
            `SELECT * FROM places WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Ресторан с таким id не найден' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при получении ресторана по id:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

export const findNearbyPlaces = async (req, res) => {
    const { lat, lon, radius = 2 } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ message: 'Пожалуйста, передайте параметры lat и lon' });
    }

    const radiusInKm = Number(radius);

    // Проверка правильности радиуса
    if (isNaN(radiusInKm) || radiusInKm <= 0) {
        return res.status(400).json({ message: 'Неверный радиус' });
    }

    try {
        const result = await db.query(`
            SELECT id, name, latitude, longitude,
                   ST_Distance(
                           ST_SetSRID(ST_MakePoint($2, $1), 4326),
                           ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
                   ) / 1000 AS distance_km
            FROM places
            WHERE ST_Distance(
                          ST_SetSRID(ST_MakePoint($2, $1), 4326),
                          ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
                  ) <= $3 * 1000  -- Применение радиуса
        `, [lat, lon, radiusInKm]);

        const data = result.rows;

        // Если данных не найдено в заданном радиусе
        if (data.length === 0) {
            return res.status(404).json({ message: 'Ничего не найдено в этом радиусе' });
        }

        data.sort((a, b) => a.distance_km - b.distance_km);

        // Успешный ответ с данными
        return res.json(data);
    } catch (error) {
        console.error('Ошибка при поиске ближайших мест:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
};
