import express from "express";

import * as dotenv from 'dotenv';
import { enableAirtime, getUsers, login, register } from "../controllers/user.js";


dotenv.config();
const router = express.Router();

router.get('/time', (req, res) => {
    const serverTime = new Date().toISOString(); 

    const options = { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone  };
      // const { timeZone } = new Date().toLocaleString('en', options);
      const timeWithZone = new Date().toLocaleString();
      const timeCorrection = new Date().toString();
  
    const timez = { toIsoString: serverTime, timeZone: timeWithZone, newTime: timeCorrection };
    return res.json({ isLogged: true, time: timez});  
})

router.post('/register', register);
router.post('/login', login);
router.get('/users', getUsers);
router.post('/enable', enableAirtime);


export default router;
