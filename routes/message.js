import { Router } from "express";
import { getAllMessages, getMessage, mapSenderID, messageCallback, sendSingleMessage, uploadMessages, viewUserSenderIDs } from "../controllers/message.js";

const routerMessage = Router();

routerMessage.post('/', getMessage);
routerMessage.post('/received', getAllMessages);
routerMessage.post('/upload', uploadMessages);
routerMessage.post('/sendone', sendSingleMessage);
routerMessage.post('/callback', messageCallback);
routerMessage.post('/mapsid', mapSenderID);
routerMessage.post('/viewsid', viewUserSenderIDs);

export default routerMessage;