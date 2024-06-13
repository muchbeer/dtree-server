import {  generateAirtelTokenCollect, generateAirtelTokenDisburse, generateTransactionId } from './utils/common.js';
import tryCatch from './utils/trycatch.js'
import jwt from 'jsonwebtoken';
import axios from 'axios';



export const sendMoneyUseAxios = tryCatch (async( req, res ) => {

    const { phonenumber, amount } = req.body

    const token = await generateAirtelTokenDisburse()
    console.log('The token is now '+ token);

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
        'Authorization': 'Bearer ' + token
      };

    console.log('generated ID: ' + generateTransactionId())

    await axios.post(url, data,  { headers: disburse_headers })
        .then((respons) => {
        console.log('The response is success');
        console.log('The body is now : ' + JSON.stringify(respons.data));
       
        return res.status(200).json({ success: true, result: respons.data })
    }).catch(error => {
        console.log('The response is failed');
        console.log('The body is now : ' + JSON.stringify(error));
        return res.status(400).json({ success: false, message: error })
    })

})

export const collectMoneyUseAxios = tryCatch( async( req, res ) => {
   

    const token = await  generateAirtelTokenCollect();

    console.log('The collect token is : ' + token);
    const url = 'https://openapiuat.airtel.africa/merchant/v1/payments/';
    
    const collect_headers = {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'X-Country': 'TZ',
        'X-Currency': 'TZS',
        'Authorization': 'Bearer ' + token
    };

    const data = {
        "reference": "Testing transaction",
        "subscriber": {
        "country": "TZ",
        "currency": "TZS",
        "msisdn": 785670839
        },
        "transaction": {
        "amount": 1000000,
        "country": "TZ",
        "currency": "TZS",
        "id": generateTransactionId()
        }
    };

    axios.post(url, data, { collect_headers })
        .then(response => {
        console.log('Success:', response.data);
        return res.status(201).json({ success: true, result: response.data })
    })
    .catch(error => {
        console.error('Error:', error.response ? error.response.data : error.message);
        return res.status(401).json({ success: false, message: error })
    });

});

export const sendairtelmoney = tryCatch (async(req, res) => {

    const { phonenumber, amount } = req.body


    const headers = {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'X-Country': 'TZ',
        'X-Currency': 'TZS',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhvbWVAZ21haWwuY29tIiwicGFzc3dvcmQiOiJob21lMTIzIiwiaWF0IjoxNzE3NTkyMzQxLCJleHAiOjE3MTc1OTU5NDF9.LMYrIWzXPkXXjGZ11T8QRvMCevBZmCQWZqWY3oBG8C4',
      };

    const inputBody = {
        'payee': {
            'msisdn': phonenumber,
            'wallet_type': 'NORMAL'
        },
        'reference': generateTransactionId(),
        'pin': process.env.AIRTEL_PIN,
        'transaction': {
            'amount': amount,
            'id': generateTransactionId(),
            'type': 'B2C'
        }
    }


    await fetch('https://openapiuat.airtel.africa/standard/v3/disbursements', {
        method: 'POST',
        body: inputBody,
        headers: headers
      }).then((response) => {
            console.log('Response is now : ' + JSON.stringify(response))
            console.log('This is the body : ' + JSON.stringify(response.body))
            return res.json();
      }).then(body => {
            console.log('The dependent onject is : ' + body)
            console.log('Now receive the body : ' + JSON.stringify(body.status) )
           // console.log('Stringify : ' + JSON.stringify(body))
      })
          
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

 