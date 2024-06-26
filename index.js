import express from "express";
import * as dotenv from 'dotenv';
import router from "./routes/auth.js"

import bodyParser from "body-parser";
import routerBalance from "./routes/balance.js";
import routerAirtime from "./routes/airtime.js";
import routerMessage from './routes/message.js';
import routerContact from "./routes/contact.js";
import routerAirtelMoney from "./routes/airtelmoney.js";
import routerUSSD from "./routes/ussd.js";
import routerWalinzi from "./routes/ulinzi.js";


dotenv.config();
const app = express();

app.use(express.json());

const allowedOrigins = [process.env.CLIENT_SERVER_URL_HIGHLINK , process.env.CLIENT_SERVER_URL, 'http://localhost:3000',];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});
/*
app.use((req, res, next) => {
  //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_SERVER_URL_HIGHLINK );
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
}); */

app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', router ); 
app.use('/api/balance', routerBalance );
app.use('/api/airtime', routerAirtime );
app.use('/api/message', routerMessage );
app.use('/api/contact', routerContact );
app.use('/api/airtelmoney', routerAirtelMoney );
app.use('/api/ussd', routerUSSD );
app.use('/api/thomas', routerWalinzi );


const port = process.env.PORT || 5001;

app.get('/api', (req, res) => {
  
  res.status(200).json( {user: 'Login successful'} )
});

app.get('/', (req, res) => {
  res.status(200).json({user: 'Gadiel'});
})


app.listen(port, ()=> {
  console.log(`listening to port ${port}`);
});
