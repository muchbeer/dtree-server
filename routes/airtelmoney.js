import { Router } from "express";

import { collectMoneyUseAxios, sendMoneyUseAxios,  } from '../controllers/airtelmoney.js';

const routerAirtelMoney = Router();


routerAirtelMoney.post( '/disburse', sendMoneyUseAxios );

routerAirtelMoney.post( '/collect', collectMoneyUseAxios );

export default routerAirtelMoney;