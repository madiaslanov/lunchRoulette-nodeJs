import * as service from '../service/filterService.js';
import {getFilteredPlaces} from "../service/filterService.js";

export const filterAndFindNearbyPlaces = async (req, res) => {
    const { lat, lon, radius = 2 } = req.query;
    if (!lat || !lon) return res.status(400).json({ message: 'lat и lon обязательны' });

    try {
        const places = await service.filterAndFindNearby(req.query);
        if (places.length === 0) return res.status(404).json({ message: 'Ничего не найдено' });
        res.json(places);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const searchPlaceByName = async (req, res) => {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: 'name обязателен' });

    try {
        const places = await service.findByName(name);
        if (places.length === 0) return res.status(404).json({ message: 'Не найдено' });
        res.json(places);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPlacesByRating = async (req, res) => {
    const { sort = 'id', order = 'asc' } = req.query;
    const validFields = ['id', 'name', 'rating', 'avg_price_range', 'wait_time'];
    const validOrders = ['asc', 'desc'];

    const sortField = validFields.includes(sort) ? sort : 'id';
    const sortOrder = validOrders.includes(order.toLowerCase()) ? order.toUpperCase() : 'ASC';

    try {
        const places = await service.getPlaces(sortField, sortOrder);
        res.json(places);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getPlaceById = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'id обязателен' });

    try {
        const place = await service.getPlace(id);
        if (!place) return res.status(404).json({ message: 'Не найдено' });
        res.json(place);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const findNearbyPlaces = async (req, res) => {
    const { lat, lon, radius = 2 } = req.query;
    if (!lat || !lon) return res.status(400).json({ message: 'lat и lon обязательны' });

    const radiusInKm = Number(radius);
    if (isNaN(radiusInKm) || radiusInKm <= 0) return res.status(400).json({ message: 'Неверный радиус' });

    try {
        const data = await service.findNearbySimple(lat, lon, radiusInKm);
        if (data.length === 0) return res.status(404).json({ message: 'Не найдено' });
        data.sort((a, b) => a.distance_km - b.distance_km);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPlaces = async (req, res) => {
    try {
        const { price_range, cuisine, max_wait_time } = req.query;
        const filters = { price_range, cuisine, max_wait_time };

        const places = await getFilteredPlaces(filters);
        res.status(200).json({ places });
    } catch (err) {
        console.error("Get places error:", err);
        res.status(500).json({ error: err.message || "Server error while fetching places" });
    }
};
