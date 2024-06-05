import { Router } from "express";

import { sendairtelmoney, verifyToken } from '../controllers/airtelmoney.js';

const routerAirtelMoney = Router();


routerAirtelMoney.post('/disburse', verifyToken, sendairtelmoney );

export default routerAirtelMoney;