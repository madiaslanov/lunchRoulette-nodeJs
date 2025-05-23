import db from '../config/db.js';
import supabase from "../config/supabaseClient.js";

export const getNearbyPlaces = async (params, whereClause, lat, lon, radiusInKm) => {
    const query = `
        SELECT id, name, address, cuisine, price_range, wait_time, rating, avg_price_range, seats, wifi, music,
               kids_friendly, parking, working_hours, image_url, latitude, longitude,
               ST_Distance(
                   ST_SetSRID(ST_MakePoint($1, $2), 4326),
                   ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
               ) / 1000 AS distance_km
        FROM places
        WHERE ST_Distance(
                  ST_SetSRID(ST_MakePoint($1, $2), 4326),
                  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
              ) <= $3 * 1000
          ${whereClause}
        ORDER BY distance_km ASC
    `;
    return db.query(query, params);
};

export const searchByName = (name) => {
    return db.query(`SELECT * FROM places WHERE name ILIKE $1`, [`%${name}%`]);
};

export const getAllSorted = (sortField, sortOrder) => {
    return db.query(`SELECT * FROM places ORDER BY ${sortField} ${sortOrder}`);
};

export const getById = (id) => {
    return db.query(`SELECT * FROM places WHERE id = $1`, [id]);
};

export const getNearbySimple = (lat, lon, radiusInKm) => {
    const query = `
        SELECT id, name, latitude, longitude,
               ST_Distance(
                   ST_SetSRID(ST_MakePoint($2, $1), 4326),
                   ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
               ) / 1000 AS distance_km
        FROM places
        WHERE ST_Distance(
                  ST_SetSRID(ST_MakePoint($2, $1), 4326),
                  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
              ) <= $3 * 1000
    `;
    return db.query(query, [lat, lon, radiusInKm]);
};


export const fetchPlaces = async ({ price_range, cuisine, max_wait_time }) => {
    let query = supabase.from("places").select("*");

    if (price_range) {
        query = query.eq("price_range", price_range);
    }

    if (cuisine) {
        query = query.ilike("cuisine", `%${cuisine}%`);
    }

    if (max_wait_time) {
        query = query.lte("wait_time", parseInt(max_wait_time));
    }

    const { data, error } = await query;

    if (error) {
        console.error('Ошибка запроса к Supabase:', error);
    }

    return { data, error };
};