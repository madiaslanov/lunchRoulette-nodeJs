import express from 'express';
import {
    createRestaurant, deleteRestaurant,
    getRestaurantById,
    getRestaurants,
    updateRestaurant
} from "../controllers/restaurantController.js";



const router = express.Router();

// Создание нового ресторана
router.post('/places', createRestaurant);

// Получение всех ресторанов
router.get('/places', getRestaurants);

// Получение ресторана по id
router.get('/places/:id', getRestaurantById);

// Обновление данных ресторана
router.put('/places/:id', updateRestaurant);

// Удаление ресторана
router.delete('/places/:id', deleteRestaurant);

export default router;