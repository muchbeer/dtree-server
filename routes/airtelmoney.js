import { Router } from "express";

import { generateEncryptedKey, sendMoneyUseAxios,  } from '../controllers/airtelmoney.js';

const routerAirtelMoney = Router();


routerAirtelMoney.post( '/disburse', sendMoneyUseAxios );

routerAirtelMoney.get( '/pin', generateEncryptedKey);

export default routerAirtelMoney;