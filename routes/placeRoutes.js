import express from 'express';
import {createPlace, getPlaces} from '../controllers/placeController.js';
import {
    filterAndFindNearbyPlaces,
     findNearbyPlaces,
    getPlaceById,
    getPlacesByRating,
    searchPlaceByName
} from "../controllers/filterController.js";

const router = express.Router();
// places | POST
router.post('/places', createPlace);

// places | GET

router.get('/places', getPlaces);

// filter | GET

router.get('/restaurants/filter', filterAndFindNearbyPlaces);

// restaurantNameSearch | GET

router.get('/places/search', searchPlaceByName);

// ratingSort | GET

router.get('/places/rating', getPlacesByRating);

// restaurantById | GET

router.get('/restaurant/:id', getPlaceById);

// nearestPlaces | GET
router.get('/places/nearby', findNearbyPlaces);


export default router;
