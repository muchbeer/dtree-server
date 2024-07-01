import { Router } from "express";
import { thomaslogic, ussdToken } from "../controllers/ussd.js";

const routerUSSD = Router();

routerUSSD.post('/ticket', thomaslogic );
routerUSSD.post('/token', ussdToken );


export default routerUSSD;

//