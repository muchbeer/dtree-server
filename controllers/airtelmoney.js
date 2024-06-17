import {   currentTime, generateTransactionId } from './utils/common.js';
import tryCatch from './utils/trycatch.js'
import jwt from 'jsonwebtoken';
import axios from 'axios';
import connect from '../config.js';



export const sendMoneyUseAxios = tryCatch (async( req, res ) => {

    const { phonenumber, amount } = req.body

    const postData = {
        client_id: process.env.AIRTEL_CLIENT_ID,
        client_secret: process.env.AIRTEL_SECRET_KEY,
        grant_type: "client_credentials"
    }

    const tokenData = await axios.post('https://openapiuat.airtel.africa/auth/oauth2/token' , postData, 
        { headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            }
        })
    
    const { access_token } = tokenData.data;

   
    const data = {
        "payee": {
          "msisdn": phonenumber
        },
        "reference": "PayTemeria",
        "pin": process.env.AIRTEL_PIN,
        "transaction": {
          "amount": amount,
          "id": generateTransactionId()
        }
      };

    const url = 'https://openapiuat.airtel.africa/standard/v1/disbursements/';

    const disburse_headers = {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'X-Country': 'TZ',
        'X-Currency': 'TZS',
        'Authorization': 'Bearer ' + access_token
      };

      const sql = `INSERT INTO airtelmoney_api (
       id, phone_number, amount, access_token, reference, status, response_code, 
       result_code, message, airtel_money_id, transact_date, business_type  
       ) 
      VALUES 
      ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
       ) 
      RETURNING *;
      `;
      
      
    await axios.post(url, data,  { headers: disburse_headers })
        .then( async(respons) => {
            const disburse = respons.data.result
            const id = disburse.data.transaction.id
            const phone_number = data.payee.msisdn 
            const amount = data.transaction.amount 
            const token = access_token
            const reference = data.reference
            const status = disburse.status.success 
            const response_code = disburse.status.response_code 
            const result_code = disburse.status.result_code 
            const message = disburse.status.message
            const airtel_money_id = disburse.data.transaction.airtel_money_id
            const transact_date = currentTime()
            const business_type = 'B2C'

            const values = [ id, phone_number, amount, token, reference, status, response_code, result_code, message,airtel_money_id, transact_date, business_type ];

            await connect.query( sql, values ).catch(error => {
                console.log('Please capture error of the disbursement ' + error);
                return res.status(200).json({ success:true, result: 'payment is made but data not save to the db ' })
            });
        
            return res.status(200).json({ success: true, result: respons.data })
    }).catch(error => {
        console.error('B2C Error:', error.response ? error.response.data : error.message);
        return res.status(400).json({ success: false, message: error })
    })

});

export const collectMoneyUseAxios = tryCatch( async( req, res ) => {
   

    const postData = {
        client_id: process.env.AIRTEL_CLIENT_ID_COLLECT,
        client_secret: process.env.AIRTEL_SECRET_KEY_COLLECT,
        grant_type: "client_credentials"
    }

    const token = await axios.post('https://openapiuat.airtel.africa/auth/oauth2/token' , postData, 
        { headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            }
        })
    
    const { access_token } = token.data;

    const url = 'https://openapiuat.airtel.africa/merchant/v1/payments/';
    
    const collect_headers = {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'X-Country': 'TZ',
        'X-Currency': 'TZS',
        'Authorization': 'Bearer ' + access_token
    };

    const data = {
        "subscriber": {
          "country": "TZ",
          "currency": "TZS",
          "msisdn": 785670839
        },
        "reference": "Testing transaction",
        "transaction": {
          "amount": 1000000,
          "country": "TZ",
          "currency": "TZS",
          "id": generateTransactionId()
        }
    };

    const sql_collect = `INSERT INTO airtelmoney_api (
        id, phone_number, amount, access_token, reference, status, response_code, 
        result_code, message, transact_date, business_type  
        ) 
       VALUES 
       ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) 
       RETURNING *;
       `;

    await axios.post(url, data, { headers: collect_headers })
        .then( async(respons)  => {

            const collect = respons.data.result
              console.log('Call collect response : respons.data.result');
              console.log('The result collected is : ' + JSON.stringify(collect))
          
            const id = collect.data.transaction.id
            console.log('Call the id is : ' + id );
            const phone_number = data.subscriber.msisdn 
            console.log('Call the phone Number : ' + phone_number );
            const amount = data.transaction.amount 
            console.log('Call the amount ' + amount);
            const token = access_token
            console.log('Call the token : ' + token );
            const reference = data.reference
            console.log('Call the reference : ' + reference );
            const status = collect.data.transaction.status 
            console.log('Call the status : ' + status );
            const response_code = collect.status.response_code 
            console.log('Call the response code : ' + response_code );
            const result_code = collect.status.result_code 
            console.log('Call result code : ' + result_code)
            const message = collect.status.message
            console.log('Call the message : ' + message)
            const transact_date = currentTime()
            const business_type = 'C2B'

            const collect_values = [ id, phone_number, amount, token, reference, status, response_code, result_code, message, transact_date, business_type ];

            await connect.query( sql_collect, collect_values ).catch(error => {
                console.log('Please capture error for collection ' + error);
                return res.status(200).json({ success: true, result: 'payment is made but data not save to the db ' })
            });

        return res.status(201).json({ success: true, result: respons.data })
    }).catch(error => {
        console.error('C2B Error:', error.response ? error.response.data : error.message);
        return res.status(401).json({ success: false, message: error })
    }); 

});


// Middleware to verify the token
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if(authHeader) {
        const token = authHeader && authHeader.split(' ')[1];
        
        jwt.verify(token, process.env.AIRTEL_SECRET_KEY, (err, data) => {
            if(err) {
                return res.status(403).json({ success:false, message: 'Token is not valid' } );
            }

            req.data = data;
            next();
        })
    } else {
        return res.status(401).json({ success: false, message: 'You are not authenticated' });
  
    } 
}

 