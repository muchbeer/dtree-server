import  { Router } from "express";
import { deductAirtime, getATBalance, getBalance, topupAirtime } from "../controllers/balance.js";


const routerBalance = Router();

routerBalance.post('/', getBalance);
routerBalance.post('/deduct', deductAirtime);
routerBalance.post('/topup', topupAirtime);
routerBalance.get( '/balance', getATBalance )

export default routerBalance;
