import connect from "../config.js";
import tryCatch from "./utils/trycatch.js";
import axios from 'axios';
import AfricasTalking from 'africastalking';
import { convertNetworkCode, credentials } from "./utils/common.js";


const africasTalking = AfricasTalking(credentials);
  
const messageApi = africasTalking.SMS;


export const getMessage = tryCatch(async (req, res ) => {
   
    const sql = 'SELECT * FROM dtree_message_main ORDER BY id desc';

    const result_view_message = await connect.query( sql );
    const fetch_data = result_view_message.rows
    return res.status(200).json( {success: true , result: fetch_data} )
  });

export const getAllMessages = tryCatch(async (req, res) => {

    const sql = 'SELECT * FROM dtree_message_received WHERE main_id = $1';
        
        const {id} = req.body;
        const values =  [ id ]
    
        await connect.query( sql, values )
         .then( result_messages => {
          return res.status(200).json( { success: true, result: result_messages.rows });
         })
         .catch(ex => {
          return res.status(202).json( {success: false, message: ex.message}  );
         })
  });

export const uploadMessages = tryCatch(async (req, res) => {

    const { phoneNumbers, sid, message } = req.body;
      
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
  
    if(resp.data) {
      sendBulkSMSToDb( resp.data, false, message );
      return res.status(201).json( {success: true, result: resp.data } )
    } else {
      return res.status(400).json( {success: false, message: 'Failed to submit the file'} )
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

export const messageCallback = tryCatch(async (req, res) => {
    const { status, id , networkCode } = req.body;
    const convertMNO = convertNetworkCode(networkCode);
    const sql = 'UPDATE dtree_message_received SET status = $1, network_code = $2 WHERE message_id = $3'
      const values = [ status, convertMNO, id ];
      
      await connect.query( sql, values )
      .then(() => {
        return res.status(201); })
      .catch(ex => {
        return res.status(401).json({ success: false, message: ex.message });
      });
  
  });

const sendBulkSMSToDb = async(respData, isSingle, userMessage) => {
  const { SMSMessageData }  = respData

  const utcDate = new Date();

  const offsetMinutes = 3 * 60;

  const gmtPlus3Date = new Date(utcDate.getTime() + offsetMinutes * 60000);

  const datestr = gmtPlus3Date.toString().slice(0, -37); 

  try {
    const sql = 'INSERT INTO dtree_message_main ( description, connect_date, user_message  ) VALUES ( $1, $2, $3 ) RETURNING *';
    const sql_received = 'INSERT INTO dtree_message_received (  phone_number, message_cost, message_id, status, status_code, main_id, is_single_message  ) VALUES( $1, $2, $3, $4, $5, $6, $7) RETURNING *';
    const values = [  SMSMessageData.Message, datestr, userMessage ];


    const result_message_main = await connect.query(sql, values)
    const main_id = result_message_main.rows[0].id;
    console.log('date received is : ' + main_id);

    SMSMessageData.Recipients.forEach( async( message ) => {

    const values_message = [ message.number, message.cost, message.messageId, message.status, message.statusCode, main_id, isSingle];

    await connect.query(sql_received, values_message);

});

} catch (error) {
    console.log('This saving data to database brought error and it is : '+ error);  
}
  };