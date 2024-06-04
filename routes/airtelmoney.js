import { Router } from "express";

import { sendairtelmoney } from '../controllers/airtelmoney.js';

const routerAirtelMoney = Router();

routerAirtelMoney.post('/disburse', sendairtelmoney );

export default routerAirtelMoney;