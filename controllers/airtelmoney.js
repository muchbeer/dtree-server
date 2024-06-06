import { generateTransactionId } from './utils/common.js';
import tryCatch from './utils/trycatch.js'
import jwt from 'jsonwebtoken';
import { stringify, parse } from 'flatted';
import axios from 'axios';

export const generateToken = tryCatch (async( req, res ) => {
    
    const postData = {
        client_id: process.env.AIRTEL_CLIENT_ID,
        client_secret: process.env.AIRTEL_SECRET_KEY,
        grant_type: process.env.AIRTEL_PIN
        }

    const tokenGenerate = await axios.post('https://openapiuat.airtel.africa/auth/oauth2/token' , postData, 
        { headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
          }
    });

    const respons = tokenGenerate.data
    if(respons) {
    console.log('The body is now : ' + respons);
    console.log('The JSON TOKEN is : ' + JSON.stringify(respons));
    return res.status(201).json({ success:true, token: respons })
    }else {
    return res.status(400).json({ success: false, message: 'Failed to connect to airtel' })
  }
});

export const sendMoneyUseAxios = tryCatch (async( req, res ) => {
    console.log('This is the new beginning')
    const { phonenumber, amount } = req.body

    const postData = {
        client_id: process.env.AIRTEL_CLIENT_ID,
        client_secret: process.env.AIRTEL_SECRET_KEY,
         grant_type: "dR5tAaok6j+QqVJm4dy3PCc9fEz0z2gNTwsBvb9WmSJ/4Ier+vnH4zGlKunVg5nUPL/CMgkMjtvrU5dJWnKvHV4ur62Pu6VthNXFJYK6PDzvYXPxRWJ1qHiEQ6Y2MzXP0eKOII0agJ7hcYcuH9kQ0jctSpc0sb48lYcVt6WTwW4=" 
        }

    const tokenGenerate = await axios.post('https://openapiuat.airtel.africa/auth/oauth2/token' , postData, 
        { headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            }
        });

    const tken = tokenGenerate.data
    console.log('Token is now : ' + tken);
    console.log('Token JSON is ' + JSON.stringify(tken))

    const data = {
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
    const resp = await axios.post('https://openapiuat.airtel.africa/standard/v3/disbursements', data, 
        { headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'X-Country' : 'TZ',
            'X-Currency' : 'TZS',
            'Authorization' : 'Bearer ' + tken
           // 'Authorization' : 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhvbWVAZ21haWwuY29tIiwicGFzc3dvcmQiOiJob21lMTIzIiwiaWF0IjoxNzE3NTk2NTMxLCJleHAiOjE3MTc2Mjg5MzF9.Kd6YuDQX7uWoCNdsQ4k263jG6C9t2Uc2HFK47Sayeks'
      }
    });

    const respons = resp.data
    if(respons) {
    console.log('The body is now : ' + respons);
    console.log('The status is now : ' + respons.status);
    }else {
    return res.status(400).json( {success: false, message: 'Failed to connect to airtel'} )
  }

})

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

 