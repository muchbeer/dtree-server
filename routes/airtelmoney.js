import { Router } from "express";

import { collectMoneyUseAxios, retrieveAllMoney, retrieveAllMoneySent, sendMoneyUseAxios,  } from '../controllers/airtelmoney.js';

const routerAirtelMoney = Router();


routerAirtelMoney.post( '/disburse', sendMoneyUseAxios );

routerAirtelMoney.post( '/collect', collectMoneyUseAxios );

routerAirtelMoney.post( '/', retrieveAllMoney );

routerAirtelMoney.post( '/sent', retrieveAllMoneySent );

export default routerAirtelMoney;