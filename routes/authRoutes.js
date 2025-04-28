import express from 'express';
import {registerController, loginController, deleteController} from "../controllers/authController.js";


const router = express.Router();
//register | POST
router.post('/register', registerController);
//login | POST
router.post('/login', loginController)
//delete | DELETE
router.delete('/deleteUser/:userId', deleteController)

export default router;
