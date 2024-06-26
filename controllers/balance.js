import connect from "../config.js";
import { getLastRecord } from "../routes/common.js";
import tryCatch from "./utils/trycatch.js";
import axios from "axios";

export const getBalance = tryCatch(async (req, res) => {

    const { user } = req.body
    const retrieve_last_record = await getLastRecord(user.email);
    if(retrieve_last_record == "noUser") {
      return res.status(206).json({ success: false });
    } else {
      return res.status(200).json({ success: true, result: retrieve_last_record });
    }

    
  });

  export const getATBalance = tryCatch( async ( req, res ) => {
      
    const balanceUrl = process.env.AT_USER_BALANCE + "?username=muchbeerx";
  
    const resp = await axios.get(balanceUrl, 
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'apiKey' : process.env.ATX_API_KEY
        }
      });
    return res.status(200).json({ success: true, result: resp.data }) 
    
  })

export const deductAirtime = tryCatch(async (req, res) => {

  const {username, deduct } = req.body

  const balance_object = await getLastRecord(username);
        const current_balance_spent = balance_object.balance_spent;
        const current_balance = parseInt(balance_object.balance);
        const updated_balance = current_balance - parseInt(deduct); 
        const values_balance_updated = [ updated_balance.toString(), deduct, username, current_balance_spent ]; 
        const sql_new_balance = 'INSERT INTO airtime_balance ( balance, deduct, user_email, balance_spent ) VALUES ( $1, $2, $3, $4 ) RETURNING *';
        await connect.query( sql_new_balance, values_balance_updated )
                .then((deduct_result) => {
                    return res.status(200).json( {success: true, result: deduct_result.rows[0]}); 
                })
                .catch(ex => {
                   
                    return res.status(400).json( {success: false, message: ex.message} )
            
         });

});

export const topupAirtime = tryCatch(async (req, res) => {

  const { username, topup } = req.body; 

      const current_balance_object = await getLastRecord(username);
      const updated_balance = parseInt(topup) + parseInt(current_balance_object.balance); 
      const updated_total_spent = parseInt(topup) + parseInt(current_balance_object.balance_spent);
      const values_balance_updated = [ updated_balance.toString(), topup, username, updated_total_spent ]; 

      const sql_new_balance = 'INSERT INTO airtime_balance ( balance, topup, user_email, balance_spent ) VALUES ( $1, $2, $3, $4 ) RETURNING *';
      await connect.query( sql_new_balance, values_balance_updated )
              .then((topup_result) => {
                if(topup_result) {
                  return res.status(201).json({ success: true, result: topup_result.rows[0] }); 
                } else {
                  return res.status(206).json({ success: false })
                }
                
              })
              .catch(ex => {
                return res.status(400).json( {success: false, message: ex.message} )
       });

});

