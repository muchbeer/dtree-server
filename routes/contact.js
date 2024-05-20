import { Router } from "express";
import { getAllContacts, getSelectedGroup, getSelectedNames, getSelectedNumbers, saveContactsDb } from "../controllers/contacts.js";


const routerContact = Router();

routerContact.post('/', getAllContacts);
routerContact.post('/save', saveContactsDb);
routerContact.post('/names', getSelectedNames);
routerContact.post('/groups', getSelectedGroup);
routerContact.post('/numbers', getSelectedNumbers);


export default routerContact;