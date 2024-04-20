import { Router } from "express";
import { airtimeCallback, getAirtime, getAllAirtimes, sendSingleAirtime, uploadAirtimes } from '../controllers/airtime.js';

const routerAirtime = Router();

routerAirtime.get('/', getAirtime);
routerAirtime.post('/received', getAllAirtimes);
routerAirtime.post('/upload', uploadAirtimes);
routerAirtime.post('/sendone', sendSingleAirtime);
routerAirtime.post('/callback', airtimeCallback);

export default routerAirtime;

