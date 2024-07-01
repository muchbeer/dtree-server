import {   currentTime, deductBalanceFromUser, generateTransactionId, sumItemInDataObject } from './utils/common.js';
import tryCatch from './utils/trycatch.js'
import jwt from 'jsonwebtoken';
import axios from 'axios';
import connect from '../config.js';


export const sendMoneyUseAxios = tryCatch (async( req, res ) => {

    // const { phonenumber, amount } = req.body
    const { inputs, user } = req.body

    const postData = {
        client_id: process.env.AIRTEL_CLIENT_ID,
        client_secret: process.env.AIRTEL_SECRET_KEY,
        grant_type: "client_credentials"
    }
    
    const token_url_test = 'https://openapiuat.airtel.africa/auth/oauth2/token'
    const token_url_live = 'https://openapi.airtel.africa/auth/oauth2/token'
    const tokenData = await axios.post(token_url_test , postData, 
        { headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            }
        })
    
    const { access_token } = tokenData.data;
    const transactId = generateTransactionId()
    console.log('The value of token is : ', access_token );

    const url_live ='https://openapi.airtel.africa/standard/v1/disbursements/'
    const url_test = 'https://openapiuat.airtel.africa/interops/v1/payments/';

    const disburse_headers = {
        'Content-Type': 'application/json',
        'X-Country': 'TZ',
        'X-Currency': 'TZS',
        'Authorization': 'Bearer ' + access_token
      };

      const sql = `INSERT INTO airtelmoney_api (
       id, phone_number, amount, access_token, reference, status, response_code, 
       result_code, message, airtel_money_id, transact_date, bussiness_type, user_email, connect_id 
       ) 
      VALUES 
      ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
       ) 
      RETURNING *;
      `;   

      const sql_error = `INSERT INTO airtelmoney_api (
      id, phone_number, amount, access_token, reference, message, transact_date, bussiness_type, user_email, connect_id
      )
      VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10 ) RETURNING *;`;
      
      
      const sql_main = `INSERT INTO airtelmoney_main (
      the_date, description, amount, user_email ) 
      VALUES ( $1, $2, $3, $4 ) RETURNING *;`;

        const user_email = user.email
        const totalAmount = inputs.length > 0 ? sumItemInDataObject(inputs) : 0
        const values_main = [ currentTime(), 'Pay Client', totalAmount.toString(), user_email ]
        const mainValue = await connect.query( sql_main, values_main );
        const main_id = mainValue.rows[0]
        const connect_id = main_id.id
        const business_type = 'B2C'
        
    inputs.forEach( async (dataItem) => {
         
         const data = {
            "payee": {
              "identifier_type": dataItem.phoneNumber,
              "identifier_value": dataItem.phoneNumber,
              "institute_category": "MERCHANT",
              "institution_code": "tips-mno",
              "currency": "TZS"
            },
            "pin": process.env.AIRTEL_PIN,
            "transaction": {
              "amount": dataItem.amount ,
              "id": generateTransactionId(),
              "reference": "disburseToAll"
            }
          }; 
          console.log('The amount is ', dataItem.amount)
          console.log('The data sent is : ', JSON.stringify(data))

          await axios.post(url_test, data,  { headers: disburse_headers })
        .then( (respons) => {
            console.log('Succes response');
            console.log('JSON response is Now: ', JSON.stringify(respons.data))
            deductBalanceFromUser( totalAmount, user_email );
            const disburse = respons.data
            const id = transactId
            const phone_number = data.payee.identifier_type
            const amount = data.transaction.amount 
            const token = access_token
            const reference = "Reward the mafundi"
            const status = disburse.status.success
            console.log('Success is : ', JSON.stringify(disburse.status))
            const response_code = disburse?.status.response_code 
            const result_code = disburse?.status.response_code 
            const message = disburse?.data.transaction.message
            const airtel_money_id = disburse.status.response_code == 'DP00900001001' ? disburse.data.transaction.airtel_money_id  : 'no id'
            const transact_date = currentTime()

            
            const values = [ id, phone_number, amount, token, reference, status, response_code, result_code, message, airtel_money_id, transact_date, business_type, user_email, connect_id ];

            connect.query( sql, values ).catch(error => {
                const message = error.message
                const error_values = [ id, phone_number, amount, token, reference, 'B2C Error ' + message, transact_date, business_type, user_email, connect_id ]
                connect.query( sql_error, error_values );
               // return res.status(200).json({ success:true, result: 'payment is made but data not save to the db ' })
            });   
        
            return res.status(200).json({ success: true, result: respons.data })
    }).catch(error => {
        //console.error('B2C Error:', error.response ? error.response.data : error.message);

        const id = generateTransactionId()
        const phone_number = data.payee.msisdn
        const amount = data.transaction.amount 
        const reference = data.reference
        const transact_date = currentTime()
        const message = ('B2C Error:', error.response ? error.response.data : error.message)

        const error_values = [ id, phone_number, amount, access_token, reference, message, transact_date, business_type, user_email, connect_id ]
                connect.query( sql_error, error_values ).catch(errorEntry => {
                    console.log('Error saving error is : ' , errorEntry.message );
                });
        return res.status(401).json({ success: false, message: error.message })
            });
      
        });

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
        result_code, message, transact_date, bussiness_type  
        ) 
       VALUES 
       ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) 
       RETURNING *;
       `;
            

    await axios.post(url, data, { headers: collect_headers })
        .then( (respons)  => {

            const collect = respons.data
          
            const id = collect.data.transaction.id
            const phone_number = data.subscriber.msisdn 
            const amount = data.transaction.amount 
            const token = access_token
            const reference = data.reference
            const status = collect.data.transaction.status == 'Success.' ? true : false
            const response_code = collect.status.response_code 
            const result_code = collect.status.result_code 
            const message = collect.status.message
            const transact_date = currentTime()
            const business_type = 'C2B'

            const collect_values = [ id, phone_number, amount, token, reference, status, response_code, result_code, message, transact_date, business_type ];

            connect.query( sql_collect, collect_values ).catch(error => {
                console.log('Please capture error for collection ' + error);
                return res.status(200).json({ success: true, result: 'payment is made but data not save to the db ' })
            });
                
        return res.status(201).json({ success: true, result: respons.data })
    }).catch(error => {
        console.error('C2B Error:', error.response ? error.response.data : error.message);
        return res.status(401).json({ success: false, message: error.message })
    }); 

});

export const retrieveAllMoney = tryCatch ( async( req, res ) => {
    const { user } = req.body;
   
    
    const user_sql = 'SELECT * FROM airtelmoney_main WHERE airtelmoney_main.user_email = $1 ORDER BY airtelmoney_main.id desc';
    
    const values = [ user.email ]

     await connect.query( user_sql, values )
    .then( result_view_money => {
        const fetch_data = result_view_money.rows 
        return res.status(200).json({ success: true , result: fetch_data });
    })
    .catch(error => {
        console.log('The error is : ', error);
        return res.status(401).json({ success: false, message: error.message })
    });
    
});

export const retrieveAllMoneySent = tryCatch ( async( req, res ) => {
    const user_sql = 'SELECT * FROM airtelmoney_api WHERE connect_id = $1';
        
    const { id } = req.body;
    const values =  [ id ];
    await connect.query( user_sql, values )
         .then( result_airtimes => {
          return res.status(200).json( { success: true, result: result_airtimes.rows });
         })
         .catch(ex => {
          return res.status(202).json( {success: false, message: ex.message}  );
         })
})

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

 