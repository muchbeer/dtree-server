import express from "express";

import * as dotenv from 'dotenv';
import { enableAirtime, getUsers, login, register } from "../controllers/user.js";


dotenv.config();
const router = express.Router();

router.get('/time', (req, res) => {
    const serverTime = new Date().toISOString(); 


      // Current UTC time
const utcDate = new Date();

// Offset for GMT+3 in minutes (3 hours * 60 minutes)
const offsetMinutes = 3 * 60;

// Convert UTC to GMT+3
const gmtPlus3Date = new Date(utcDate.getTime() + offsetMinutes * 60000);

// Format the GMT+3 date
const formattedDate = gmtPlus3Date.toLocaleString(); // You can format it as needed


const utcformat = utcDate.toISOString()


    const timez = { toIsoString: serverTime, utcTime : utcformat, gmtTime: formattedDate };
    return res.json({ isLogged: true, time: timez});  
})

router.post('/register', register);
router.post('/login', login);
router.get('/users', getUsers);
router.post('/enable', enableAirtime);


export default router;
