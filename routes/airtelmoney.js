import { Router } from "express";

import { sendMoneyUseAxios, sendairtelmoney, verifyToken } from '../controllers/airtelmoney.js';

const routerAirtelMoney = Router();


routerAirtelMoney.post('/disburse', verifyToken, sendMoneyUseAxios );

export default routerAirtelMoney;