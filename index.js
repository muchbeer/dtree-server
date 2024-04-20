import express from "express";
import * as dotenv from 'dotenv';
import router from "./routes/auth.js"

import bodyParser from "body-parser";
import routerBalance from "./routes/balance.js";
import routerAirtime from "./routes/airtime.js";

dotenv.config();
const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
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


const port = 5000;

app.get('/api', (req, res) => {
  
  res.status(200).json( {user: 'Login successful'} )
})


app.listen(port, ()=> {
  console.log(`listening to port ${port}`);
});
