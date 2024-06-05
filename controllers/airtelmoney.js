import { generateTransactionId } from './utils/common.js';
import tryCatch from './utils/trycatch.js'
import jwt from 'jsonwebtoken';


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
            console.log('Now receive the body : ' + body)
            console.log('Stringify : ' + JSON.stringify(body))
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

 