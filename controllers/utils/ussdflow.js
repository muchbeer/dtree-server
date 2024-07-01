import { convertDate, currentTime, insertFirstEntry, returnArrayFromText, returnValueFromArrayText, selectDaraja, tiketiMessage, ulinziMessage, updateTable } from "./common";
import { sendBulkSMS } from "./common";

export const ulinziMagari = async( text, number, sessionId ) => {

    let response = '';
    const numberWithPlus = [ number.slice(1) ];

    if ( text == '' ) {
       
        insertFirstEntry( number, sessionId, currentTime() )

        response = `CON Karibu Highlink Investigation and security. Tafadhari chagua huduma
        1. Ulinzi
        2. Kata Tiketi`;
    } else if ( text == '1' ) {
        
        updateTable( 'huduma', 'Ulinzi', sessionId )

        response = `END Tunatoa huduma ya ulinzi watu na mitambo piga simu number
        0715020945`;
        
        await sendBulkSMS(  numberWithPlus, ulinziMessage )
    } else if ( text == '2' ) {

        updateTable( 'huduma', 'Tiketi', sessionId )

        response = `CON Kata tiketi ya basi kwa kuchagua daraja
        1. Daraja la juu
        2. Daraja la kati
        3. Daraja la kawaida`;
    } else if ( text == '2*1' || text == '2*2' || text == '2*3'  ) {

        const selectDaraj = selectDaraja( text );
        updateTable(  'daraja', selectDaraj, sessionId  )

        response = `CON Andika tarehe ya kusafiri mfano 24 au 30`
    } else if(  returnArrayFromText( text ) === 3  ) {

        response = `CON Andika mwezi wa kusafiri mfano 3 au 12`
    } else if(  returnArrayFromText( text ) === 4  ) {
        const dateEntry1 = returnValueFromArrayText( text, 2 )
        const dateEntry2 = returnValueFromArrayText( text, 3 )
        const month = convertDate(dateEntry2)
        const joinDate = `${dateEntry1} ${month}`
        updateTable( 'tarehe_safari', joinDate, sessionId );

        response = `CON Andika mwanzo wa safari`
    } else if(  returnArrayFromText( text ) === 5  ) {
        const startJourney = returnValueFromArrayText( text, 4 );
        updateTable( 'anatoka', startJourney, sessionId );

        response = `CON Andika mwisho wa safari`
    } else if(  returnArrayFromText( text )  == 6  ) {
        const destination = returnValueFromArrayText( text, 5 );
        updateTable( 'anaenda', destination, sessionId );

        response = `END Utapigiwa na mhudumu kwa maelezo zaidi na gharama`
        await sendBulkSMS( numberWithPlus, tiketiMessage )
    } else {
        response = `END umekosea kuchagua jaribu tena `
    }

    return response;
}

    
