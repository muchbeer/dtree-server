import  { Router } from "express";
import { deductAirtime, getBalance, topupAirtime } from "../controllers/balance.js";


const routerBalance = Router();

routerBalance.post('/', getBalance);
routerBalance.post('/deduct', deductAirtime);
routerBalance.post('/topup', topupAirtime)

export default routerBalance;
