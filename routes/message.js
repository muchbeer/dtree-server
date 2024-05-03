import { Router } from "express";
import { getAllMessages, getMessage, messageCallback, sendSingleMessage, uploadMessages } from "../controllers/message.js";

const routerMessage = Router();

routerMessage.post('/', getMessage);
routerMessage.post('/received', getAllMessages);
routerMessage.post('/upload', uploadMessages);
routerMessage.post('/sendone', sendSingleMessage);
routerMessage.post('/callback', messageCallback);

export default routerMessage;