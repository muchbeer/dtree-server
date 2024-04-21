import express from "express";

import * as dotenv from 'dotenv';
import { enableAirtime, getUsers, login, register } from "../controllers/user.js";


dotenv.config();
const router = express.Router();

router.get('/time', (req, res) => {
    const serverTime = new Date().toISOString(); 
    const timez = {server: serverTime}
    return res.json({ isLogged: true, time: timez});  
})

router.post('/register', register);
router.post('/login', login);
router.get('/users', getUsers);
router.post('/enable', enableAirtime);


export default router;
