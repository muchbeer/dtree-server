import tryCatch from "./utils/trycatch";
import { ulinziMagari } from "./utils/ussdflow";

export const ussdToken = tryCatch(async (req, res) => {

    return res.status(201).json({ success: true, token: 'User Verified using tryCatch' })   
}); 

export const thomaslogic = tryCatch( async (req, res ) => {
    const {  sessionId,  phoneNumber,  text } = req.body;

    const response = await ulinziMagari( text, phoneNumber, sessionId );

    res.set('Content-Type: text/plain');
    
    return res.send( response );
});

