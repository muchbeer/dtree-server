import { Router } from "express";

import { generateEncryptedKey, receivingMoneyUseAxios, sendMoneyUseAxios,  } from '../controllers/airtelmoney.js';

const routerAirtelMoney = Router();


routerAirtelMoney.post( '/disburse', sendMoneyUseAxios );

routerAirtelMoney.get( '/pin', generateEncryptedKey );

routerAirtelMoney.post( '/collect', receivingMoneyUseAxios );

export default routerAirtelMoney;