import connect from "../config.js";

export const testRecord = async () => {
   
    const sql_last_record = 'SELECT id, balance, balance_spent FROM dtree_airtime_balance ORDER BY id DESC LIMIT 1';
    const view_last_record = await connect.query( sql_last_record )
    const fetch_last_data = view_last_record.rows[0]
    return fetch_last_data;
}


export const getLastRecord = async (user) => {
    const user_sql_last_record = 'SELECT id, balance, user_email, balance_spent FROM airtime_balance WHERE user_email = $1 ORDER BY id DESC LIMIT 1 ';
    const values =  [ user ];

     const view_last_record = await connect.query( user_sql_last_record, values )
    const fetch_last_data = view_last_record.rows[0]

    if(fetch_last_data) {
        return fetch_last_data
    } else {
        return "noUser"
    }
   
}
