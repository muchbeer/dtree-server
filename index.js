import express from "express";
import * as dotenv from 'dotenv';
import router from "./routes/auth.js"

import bodyParser from "body-parser";
import routerBalance from "./routes/balance.js";
import routerAirtime from "./routes/airtime.js";
import routerMessage from './routes/message.js';
import routerContact from "./routes/contact.js";



dotenv.config();
const app = express();

app.use(express.json());

app.use((req, res, next) => {
  //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_SERVER_URL);
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With, Content-Type, Authorization'
  );
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', router); 
app.use('/api/balance', routerBalance);
app.use('/api/airtime', routerAirtime);
app.use('/api/message', routerMessage);
app.use('/api/contact', routerContact);


const port = 5001;

app.get('/api', (req, res) => {
  
  res.status(200).json( {user: 'Login successful'} )
});

app.get('/', (req, res) => {
  res.status(200).json({user: 'Gadiel'});
})


app.listen(port, ()=> {
  console.log(`listening to port ${port}`);
});
