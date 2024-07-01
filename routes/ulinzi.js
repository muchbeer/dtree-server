import { getAllTicket, getAllWalinzi, getMlinziDetail } from "../controllers/ulinzi";

const routerWalinzi = Router();

routerWalinzi.get('/', getAllWalinzi );
routerWalinzi.get('/tiketi', getAllTicket );
routerWalinzi.post('/mlinzi', getMlinziDetail );

export default routerWalinzi;