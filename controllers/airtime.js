import connect from "../config.js";
import tryCatch from "./utils/trycatch.js";
import { getLastRecord } from "../routes/common.js";
import axios from 'axios';
import AfricasTalking from 'africastalking';
// import * as dotenv from 'dotenv';

// dotenv.config();
const credentials = {
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME  };

const africasTalking = AfricasTalking(credentials);

const airtime = africasTalking.AIRTIME;

export const getAirtime = tryCatch(async (req, res) => {
   
   // const sql = 'SELECT * FROM dtree_airtime_main ORDER BY id desc';
    const user_sql = 'SELECT * FROM dtree_users JOIN airtime_main ON dtree_users.email = airtime_main.user_email WHERE  ORDER BY id desc';

    const result_view_airtime = await connect.query( user_sql );
    const fetch_data = result_view_airtime.rows

    return res.status(200).json( {success: true , result: fetch_data} )
  });

export const getAllAirtimes = tryCatch(async (req, res) => {

    //const sql = 'SELECT * FROM dtree_airtime_received WHERE connect_id_main = $1';
    const user_sql = 'SELECT * FROM dtree_users JOIN airtime_received ON dtree_users.email = airtime_received.user_email WHERE connect_id_main = $1';
        
        const {id} = req.body;
        const values =  [ id ];
    
        await connect.query( user_sql, values )
         .then( result_airtimes => {
          return res.status(200).json( { success: true, result: result_airtimes.rows });
         })
         .catch(ex => {
          return res.status(202).json( {success: false, message: ex.message}  );
         })
  });

export const uploadAirtimes = tryCatch(async (req, res) => {

  const { airtime, user } = req.body;
    
  const data =   {
    username: process.env.AT_USERNAME,
    recipients : airtime
    }

  const resp = await axios.post('https://api.africastalking.com/version1/airtime/send', data, 
    {headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'apiKey' : process.env.AT_API_KEY
      }
    });

  if(resp.data) {
    sendAirtimeToDb( resp.data, false, user.email );
    return res.status(201).json( {success: true, result: resp.data } )
  } else {
    return res.status(400).json( {success: false, message: 'Failed to submit the file'} )
  }
  
});

export const sendSingleAirtime = tryCatch(async (req, res) => {

  const { data, user } = req.body;
    
    const options = {
        maxNumRetry: 3, 
        recipients: data  };
    
        airtime.send(options)
        .then(response => {
            sendAirtimeToDb(response, true, user.email)
            return res.status(200).json({ success: true, result: response }); 
        }).catch(ex => {
            //console.log(error);
            return res.status(400).json({ success: false, message: ex.message });
        }); 
});

export const airtimeCallback = tryCatch(async (req, res) => {
  const { status, requestId } = req.body

  const sql = 'UPDATE dtree_airtime_received SET status = $1 WHERE request_id = $2'
    const values = [status, requestId];

    await connect.query( sql, values )
    .then(() => {
      return res.status(201); })
    .catch(ex => {
      return res.status(401).json({ success: false, message: ex.message });
    });

});


//function to save airtime to database
const sendAirtimeToDb = async(respData, isSingle, user) => { 

  const { totalAmount , totalDiscount, errorMessage,  responses }  = respData

        // Current UTC time
  const utcDate = new Date();

      // Offset for GMT+3 in minutes (3 hours * 60 minutes)
  const offsetMinutes = 3 * 60;

      // Convert UTC to GMT+3
  const gmtPlus3Date = new Date(utcDate.getTime() + offsetMinutes * 60000);

      // Format the GMT+3 date
  const datestr = gmtPlus3Date.toString().slice(0, -37); 
 
      try {
      const sql = 'INSERT INTO airtime_main ( total_amount, total_discount, error_message, connect_date, user_email ) VALUES ( $1, $2, $3, $4, $5 ) RETURNING *';
      const sql_received = 'INSERT INTO airtime_received ( amount, discount, error_message, phone_number, request_id, status, connect_id_main, is_single_airtime, user_email  ) VALUES( $1, $2, $3, $4, $5, $6, $7, $8, $9 ) RETURNING *';
      const values = [  totalAmount, totalDiscount, errorMessage, datestr, user ]
      

      const result_airtime_main = await connect.query(sql, values)
      const main_id = result_airtime_main.rows[0].id;
      console.log('date received is : ' + main_id);

     responses.forEach( async(airtime) => {

          const values_airtime = [ airtime.amount, airtime.discount, airtime.errorMessage, airtime.phoneNumber, airtime.requestId, airtime.status, main_id, isSingle, user];

          await connect.query( sql_received, values_airtime );
 
     });

     //insert into balance 
     if(errorMessage === 'None') {
      const balance_object = await  getLastRecord();
      const current_balance_spent = balance_object.balance_spent;
      const current_balance = parseInt(balance_object.balance);
      const username = balance_object.user_email;
      const deductAmount = totalAmount.replace('TZS ', '');
       const updated_balance = current_balance - parseInt(deductAmount); 
       const values_balance_updated = [ updated_balance.toString(), deductAmount, username, current_balance_spent ]; 
       const sql_new_balance = 'INSERT INTO airtime_balance ( balance, deduct, user_email, balance_spent ) VALUES ( $1, $2, $3, $4 ) RETURNING *';
       const balance_response = await connect.query( sql_new_balance, values_balance_updated );
       console.log('The airtime was sent and updated balance is : ' + JSON.stringify(balance_response));

     }
     
      } catch (error) {
          console.log('This saving data to database brought error and it is : '+ error)   
      }
      
}
