import * as dotenv from 'dotenv';
dotenv.config();

import pg from "pg";


const{ Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

const connect = 
   { query: (text, params) => pool.query(text, params) } 
 

export default connect;