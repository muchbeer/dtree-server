import connect from "../config.js";
import tryCatch from "./utils/trycatch.js";
import axios from 'axios';
import AfricasTalking from 'africastalking';
import { convertNetworkCode, credentials } from "./utils/common.js";
import { getLastRecord } from "../routes/common.js";


const africasTalking = AfricasTalking(credentials);
  
const messageApi = africasTalking.SMS;


export const getMessage = tryCatch(async (req, res ) => {
    const { user } = req.body;
   
    const user_sql = 'SELECT * FROM dtree_users JOIN message_main ON dtree_users.email = message_main.user_email WHERE message_main.user_email = $1 ORDER by message_main.id desc';
    const values = [ user.email ];

    const result_view_message = await connect.query( user_sql, values );
    const fetch_data = result_view_message.rows
    return res.status(200).json( {success: true , result: fetch_data} )
  });

export const getAllMessages = tryCatch(async (req, res) => {

    // const sql = 'SELECT * FROM dtree_message_received WHERE main_id = $1';
    const user_sql = 'SELECT * FROM dtree_users JOIN message_received ON dtree_users.email = message_received.user_email WHERE main_id = $1';
   
        
        const {id} = req.body;
        const values =  [ id ]
    
        await connect.query( user_sql, values )
         .then( result_messages => {
          return res.status(200).json( { success: true, result: result_messages.rows });
         })
         .catch(ex => {
          return res.status(202).json( {success: false, message: ex.message}  );
         })
  });

export const uploadMessages = tryCatch(async (req, res) => {

    const { phoneNumbers, sid, message, user, tag } = req.body;
      
    const data =   {
        enqueue: true,
        username: process.env.AT_USERNAME,
        senderId: sid,
        phoneNumbers: phoneNumbers,
        message: message,
      }

  
    const resp = await axios.post(process.env.AT_BULK_SMS_URL, data, 
      {headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'apiKey' : process.env.AT_API_KEY
        }
      });

    const { SMSMessageData }  = resp.data;
    if(SMSMessageData) {
      if( SMSMessageData.Message === 'InvalidSenderId' ) {
          return res.status(400).json({ success: false, message: 'Sender ID is not mapped internally' });
      }
      sendBulkSMSToDb( SMSMessageData , false, message, user.email, tag );
      return res.status(201).json({ success: true, result: resp.data })
    } else {
      return res.status(400).json({ success: false, message: 'Failed to submit the file' });
    }
    
  });

export const sendSingleMessage = tryCatch(async (req, res) => {

    const { to, message, from } = req.body;

    const options = {
        to: to,
        message: message,
        from: from
    };
      
    messageApi.send(options)
        .then(response => {
              sendBulkSMSToDb(response, true, message );
              return res.status(200).json({ success: true, result: response }); 
        }).catch(ex => {
              //console.log(error);
              return res.status(400).json({ success: false, message: ex.message });
        }); 
  });

export const mapSenderID = tryCatch(async (req, res) => {
    const { sid, email } = req.body;

    const sql_sid = 'INSERT INTO message_sid ( sender_id, user_email  ) VALUES ( $1, $2 ) RETURNING *';
    const values_sid = [sid, email];

    const result_message_sid = await connect.query(sql_sid, values_sid)
    const response_sid = result_message_sid.rows[0];

    return res.status(201).json({ success: true, result: response_sid });
    
});

export const viewUserSenderIDs = tryCatch(async (req, res) => {
  const sid_sql = 'SELECT sender_id FROM  message_sid WHERE user_email = $1';
   
        
  const { user } = req.body;
  const sid_values =  [ user ];

  await connect.query( sid_sql, sid_values )
   .then( result_sid => {
    const viewsids = result_sid.rows.map( items => items.sender_id );
    return res.status(200).json( { success: true, result: viewsids });
   })
   .catch(ex => {
    return res.status(202).json( {success: false, message: ex.message}  );
   });
});

export const messageCallback = tryCatch(async (req, res) => {
    const { status, id , networkCode } = req.body;
    const convertMNO = convertNetworkCode(networkCode);
    const sql = 'UPDATE message_received SET status = $1, network_code = $2 WHERE message_id = $3'
      const values = [ status, convertMNO, id ];
      
      await connect.query( sql, values )
      .then(() => {
        return res.status(201); })
      .catch(ex => {
        return res.status(401).json({ success: false, message: ex.message });
      });
  
  });

const sendBulkSMSToDb = async( respData, isSingle, userMessage, user, tag ) => {

  const utcDate = new Date();

  const offsetMinutes = 3 * 60;

  const gmtPlus3Date = new Date(utcDate.getTime() + offsetMinutes * 60000);

  const datestr = gmtPlus3Date.toString().slice(0, -37); 
  const recipients = respData.Recipients;

  try {
    const totalSum = recipients.reduce((accumulator, message) => {
      return accumulator + message.messageParts ;
    }, 0);

    const sql = 'INSERT INTO message_main ( description, connect_date, user_message, user_email, tag, total_message  ) VALUES ( $1, $2, $3, $4, $5, $6 ) RETURNING *';
    const sql_received = 'INSERT INTO message_received (  phone_number, message_cost, message_id, status, status_code, main_id, is_single_message, user_email, message_parts  ) VALUES( $1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *';
    const values = [  respData.Message, datestr, userMessage, user, tag, totalSum ];



    const result_message_main = await connect.query(sql, values)
    const main_id = result_message_main.rows[0].id;

    recipients.forEach( async( message ) => {

    const values_message = [ message.number, message.cost, message.messageId, message.status, message.statusCode, main_id, isSingle, user, message.messagePart];

    await connect.query(sql_received, values_message);
    });

//insert into balance 
if( recipients.length > 0 ) {

  const balance_object = await  getLastRecord(user);
  const current_balance_spent = balance_object.balance_spent;
  const current_balance = parseInt(balance_object.balance);
  const username = balance_object.user_email;
  const deductAmount = 25 * totalSum;
   const updated_balance = current_balance - parseInt(deductAmount); 
   const values_balance_updated = [ updated_balance.toString(), deductAmount, username, current_balance_spent ]; 
   const sql_new_balance = 'INSERT INTO airtime_balance ( balance, deduct, user_email, balance_spent ) VALUES ( $1, $2, $3, $4 ) RETURNING *';
   await connect.query( sql_new_balance, values_balance_updated );

 }

} catch (error) {
    console.log('This saving data to database brought an '+ error);  
}
  };