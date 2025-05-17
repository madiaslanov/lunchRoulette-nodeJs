import * as repo from '../repository/filterRepository.js';

export const filterAndFindNearby = async (query) => {
    const { cuisine, rating, wait_time, lat, lon, radius = 2 } = query;
    const radiusInKm = Number(radius);

    const params = [lat, lon, radiusInKm];
    const queryParts = [];
    let paramIndex = 4;

    if (cuisine) {
        queryParts.push(`cuisine ILIKE $${paramIndex}`);
        params.push(`%${cuisine}%`);
        paramIndex++;
    }

    if (rating) {
        queryParts.push(`rating >= $${paramIndex}`);
        params.push(rating);
        paramIndex++;
    }

    if (wait_time) {
        queryParts.push(`wait_time <= $${paramIndex}`);
        params.push(wait_time);
        paramIndex++;
    }

    const whereClause = queryParts.length > 0 ? `AND ${queryParts.join(' AND ')}` : '';
    const result = await repo.getNearbyPlaces(params, whereClause, lat, lon, radiusInKm);

    return result.rows;
};

export const findByName = async (name) => {
    const result = await repo.searchByName(name);
    return result.rows;
};

export const getPlaces = async (sortField, sortOrder) => {
    const result = await repo.getAllSorted(sortField, sortOrder);
    return result.rows;
};

export const getPlace = async (id) => {
    const result = await repo.getById(id);
    return result.rows[0];
};

export const findNearbySimple = async (lat, lon, radiusInKm) => {
    const result = await repo.getNearbySimple(lat, lon, radiusInKm);
    return result.rows;
};

export const getFilteredPlaces = async (filters) => {
    const { data, error } = await fetchPlaces(filters);
    if (error) throw new Error("Ошибка при получении данных из базы");
    return data;
};