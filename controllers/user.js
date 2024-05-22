
import bcrypt from "bcryptjs";
import connect from "../config.js";
import tryCatch from "./utils/trycatch.js";

export const register = tryCatch(async (req, res) => {
    const { name, lastname, email, password } = req.body; 

    const sql = 'INSERT INTO dtree_users (first_name, last_name, email, pass, enable_airtime, is_register) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
 
    bcrypt.hash(password.toString(), parseInt(process.env.HASH_SALT), async (err, hash) => {
        if(err) {
            console.log(err);
            res.status(500).json(err);
        }
        const values = [ name, lastname, email, hash, false, true ]
   
         await connect.query(sql, values)
        .then((result)=> {
           return res.status(201).json( {success: true, result: result.rows[0] });  
        })
        .catch(ex => {
           return res.status(409).json( {success: false, message: ex.message} )
        });
 
    });
})

export const login = tryCatch(async (req, res) => {

     const sql = "SELECT * FROM dtree_users WHERE LOWER(email) = $1";
        const { email, password } = req.body;
        const values = [email];

        const result = await connect.query(sql, values);
        const fetch_data = result.rows
        if(fetch_data.length > 0) {
            bcrypt.compare(password.toString(), fetch_data[0].pass, (err, response) => {
                if(err) {
                   return res.status(500).json( {success: false, message: 'failed to fetch the data Please try again letter'});
                } else if (response) {
 
                    if (!fetch_data[0].enable_airtime) {
                        return res.status(401).json({ success: false, message: 'This account is disabled! Try to contact the admin',});
                    }
                        
                  return  res.status(200).json({success: true, result: fetch_data[0]} );
               
                } else {
                   
                  return  res.status(202).json({ success: false, message: 'Please check your password and try again'});
                }   
            });
        }
        else {
            return res.status(202).json({ success: false, message: 'No user found, please try again'});
        }
})

export const getUsers = tryCatch(async (req, res) => {
   
    const sql = 'SELECT * FROM dtree_users ORDER BY id desc';

    const result_view_users = await connect.query( sql );
    const fetch_data = result_view_users.rows;

    return res.status(200).json({ success: true , result: fetch_data });
  });

export const getAndroidUsers = tryCatch (async (req, res) => {

    const sql = 'SELECT * FROM dtree_users ORDER BY id desc';

    const result_view_users = await connect.query( sql );
    const fetch_data = result_view_users.rows;

    return res.status(200).json({ fetch_data });
});

export const enableAirtime = tryCatch(async (req, res) => {
 
        const {id, enable_airtime } = req.body;
    

        const sql_update = 'UPDATE dtree_users SET enable_airtime = $1 WHERE id = $2 RETURNING *'
        const values_update = [ enable_airtime, id ];

                 await connect.query( sql_update, values_update )
                .then(result_updated => {
                    return res.status(201).json( {success: true, result: result_updated.rows[0]})
                }).catch(ex => {
                    return res.status(409).json( {success: false, message: ex.message} )
                });
        
}); 

export const enableUsers = tryCatch( async( req, res ) => {
    const { user, enable_airtime } = req.body;

    const sql_update_user = 'UPDATE dtree_users SET enable_airtime = $1 WHERE email = $2 RETURNING *';
    const values_user = [ enable_airtime, user ];  

    await connect.query( sql_update_user, values_user )
        .then( user_result => {
            return res.status(201).json({ success: true, result: user_result.rows[0] })
        }).catch(ex => {
            return res.status(409).json( {success: false, message: ex.message} )
        });
});