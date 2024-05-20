import { Router } from "express";
import { airtimeCallback, getAirtime, getAllAirtimes, insertAndroidevice, sendSingleAirtime, uploadAirtimes } from '../controllers/airtime.js';

const routerAirtime = Router();

routerAirtime.post('/', getAirtime);
routerAirtime.post('/received', getAllAirtimes);
routerAirtime.post('/upload', uploadAirtimes);
routerAirtime.post('/sendone', sendSingleAirtime);
routerAirtime.post('/callback', airtimeCallback);
routerAirtime.post('/android', insertAndroidevice);

export default routerAirtime;

