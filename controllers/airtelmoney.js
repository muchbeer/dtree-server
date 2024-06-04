import { generateTransactionId } from './utils/common.js';
import tryCatch from './utils/trycatch.js'

export const sendairtelmoney = tryCatch (async(req, res) => {

    const headers = {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'X-Country': 'TZ',
        'X-Currency': 'TZS',
        'Authorization': process.env.AUTHORIZATION,
        'x-signature': process.env.X-SIGNATURE,
        'x-key': process.env.X-KEY
      };

    const inputBody = {
        'payee': {
            'msisdn': '757022731',
            'wallet_type': 'NORMAL'
        },
        'reference': 'AB***141',
        'pin': process.env.AIRTEL_PIN,
        'transaction': {
            'amount': 1000,
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

