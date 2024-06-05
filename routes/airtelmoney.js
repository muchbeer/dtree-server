import { Router } from "express";

import { generateToken, sendMoneyUseAxios, sendairtelmoney, verifyToken } from '../controllers/airtelmoney.js';
import router from "./auth.js";

const routerAirtelMoney = Router();


routerAirtelMoney.post( '/disburse', verifyToken, sendMoneyUseAxios );

routerAirtelMoney.get( '/token', generateToken);

export default routerAirtelMoney;