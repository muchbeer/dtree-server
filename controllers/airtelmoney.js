import { generateTransactionId } from './utils/common.js';
import tryCatch from './utils/trycatch.js'


export const sendairtelmoney = tryCatch (async(req, res) => {

    const { phonenumber, amount } = req.body


    const headers = {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'X-Country': 'TZ',
        'X-Currency': 'TZS',
        'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhvbWVAZ21haWwuY29tIiwicGFzc3dvcmQiOiJob21lMTIzIiwiaWF0IjoxNzE3NTg5MTc3LCJleHAiOjE3MTc1OTI3Nzd9.tGp7K1-p_1sniEKa9KRJS7mEwWkrUZsWcmRZZEQZD-s',
      };

    inputBody = {
        'payee': {
            'msisdn': phonenumber,
            'wallet_type': 'NORMAL'
        },
        'reference': generateRefreshToken(),
       // 'pin': process.env.AIRTEL_PIN,
       'pin': "dR5tAaok6j+QqVJm4dy3PCc9fEz0z2gNTwsBvb9WmSJ/4Ier+vnH4zGlKunVg5nUPL/CMgkMjtvrU5dJWnKvHV4ur62Pu6VthNXFJYK6PDzvYXPxRWJ1qHiEQ6Y2MzXP0eKOII0agJ7hcYcuH9kQ0jctSpc0sb48lYcVt6WTwW4=",
        'transaction': {
            'amount': amount,
            'id': generateTransactionId(),
            'type': 'B2C'
        }
    }


    fetch('https://openapiuat.airtel.africa/standard/v3/disbursements',{
        method: 'POST',
        body: inputBody,
        headers: headers
      }).then((res) => {
            console.log(res.json())
            return res.json();
      }).then((body) => {
          console.log(body);
      });
          
    return res.status(200).json({ success: true })
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

 