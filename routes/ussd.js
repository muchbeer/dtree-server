import { Router } from "express";
import { thomaslogic, ussdToken } from "../controllers/ussd";

const routerUSSD = Router();

routerUSSD.post('/ticket', thomaslogic );
routerUSSD.post('/token', ussdToken );


export default routerUSSD;

