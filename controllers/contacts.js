import connect from "../config.js";
import tryCatch from "./utils/trycatch.js";

export const getAllContacts = tryCatch(async (req, res ) => {
    const { user } = req.body;
   
    const user_sql = 'SELECT * FROM contacts  WHERE user_email = $1 ORDER BY id desc';
    const values = [ user ];

     await connect.query( user_sql, values )
        .then(result_contacts => {
            return res.status(200).json( { success: true, result: result_contacts.rows });
        })
        .catch(ex => {
            return res.status(202).json({ success: false, message: ex.message });
           })
  });


export const getSelectedNames = tryCatch(async (req, res ) => {
    const { user } = req.body;

    const contact_sql = 'SELECT names, id, phone_number, tag  FROM contacts WHERE user_email = $1';

    const values = [ user];

    await connect.query(contact_sql, values)
        .then(result_contacts => {
            return res.status(200).json({ success: true, result: result_contacts.rows })
        }).catch(ex => {
            return res.status(202).json({ success: false, message: ex.message });
           })
});

export const getSelectedGroup = tryCatch(async (req, res ) => {
    const { user } = req.body;

    const contact_sql = 'SELECT DISTINCT tag FROM contacts WHERE ( user_email = $1 )';
    const values = [ user ];

    await connect.query(contact_sql, values)
        .then(result_contacts => {
            return res.status(200).json({ success: true, result: result_contacts.rows })
        }).catch(ex => {
            return res.status(202).json({ success: false, message: ex.message });
           })
});

export const getSelectedNumbers = tryCatch(async ( req, res ) => {
    const { user, group } = req.body;

    const contact_sql = 'SELECT phone_number FROM contacts WHERE (user_email = $1) AND ( tag = $2 )';
    const values = [ user, group ];

    await connect.query(contact_sql, values)
        .then(result_contacts => {
            return res.status(200).json({ success: true, result: result_contacts.rows })
        }).catch(ex => {
            return res.status(202).json({ success: false, message: ex.message });
           })
});


export const saveContactsDb = tryCatch(async (req, res) => {
    // const { names, phonenumber, group, user  } = req.body;

    const contacts = req.body;

    contacts.forEach( async(item) => {
        const sql = 'INSERT INTO contacts ( names, phone_number, tag, user_email ) VALUES ( $1, $2, $3, $4 ) RETURNING *';
    
        const values = [  item?.names, item.phonenumber, item.group, item.user ]
    
        await connect.query( sql, values )

    });
//return res.status(200).json( { success: true, result: result_contacts.rows });
    return res.status(201).json({ success:true, result: true });

});

