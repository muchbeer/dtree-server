import connect from "../config.js";
import tryCatch from "./utils/trycatch.js";


export const getAllWalinzi = tryCatch(async (req, res) => {
   
      const sql = 'SELECT * FROM tomticket WHERE huduma = $1 ORDER BY id desc';
  
      const values = [ 'Ulinzi' ]
      const result_view_walinzi = await connect.query( sql, values );
      const fetch_data = result_view_walinzi.rows
  
      return res.status(200).json({ success: true , result: fetch_data });
    });

export const getAllTicket = tryCatch(async (req, res) => {
   
      const sql = 'SELECT * FROM tomticket WHERE huduma = $1 ORDER BY id desc';
  
      const values_ticket = [ 'Tiketi' ]
      const result_view_ticket = await connect.query( sql, values_ticket );
      const fetch_data = result_view_ticket.rows
  
      return res.status(200).json({ success: true , result: fetch_data });
    });
  
export const getMlinziDetail = tryCatch(async (req, res) => {

        const sql_mlinzi = 'SELECT * FROM tomticket WHERE id = $1';
            
            const { id } = req.body;
            const values =  [ id ];
        
            await connect.query( sql_mlinzi, values )
             .then( result_walinzi => {
              return res.status(200).json( { success: true, result: result_walinzi.rows });
             })
             .catch(ex => {
              return res.status(202).json( {success: false, message: ex.message}  );
             })
    });