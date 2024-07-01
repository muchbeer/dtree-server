import { getLastRecord } from "../../routes/common.js";
import connect from "../../config.js";
import axios from "axios";

export const credentials = {
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME  };

export const ulinziMessage = 'Karibu sana HighLink upate huduma ya Ulinzi bora, ni furaha yetu kukuhudumia. Wahudumu wetu watakupigia simu'
export const tiketiMessage = 'Karibu sana HighLink upate huduma ya usafiri bora, wahudumu wetu watakupigia simu. '


export const convertNetworkCode = (networkCode) => {

    switch (networkCode) {
        case '64002':
            return 'Tigo';
        case '64003':
            return 'Zantel';
        case '64004':
            return 'Vodacom';
        case '64005':
            return 'Airtel';
        case '64007':
            return 'TTCL';
        case '64009':
            return 'Halotel'
        default:
            return 'No Telco';
      }
}

export const sumIteminArray = (arr) => {
    var total = 0;
    for (var i = 0; i < arr.length; i++) {
      total += arr[i];
    }
    return total;
  }

export const sumItemInDataObject = (data) => {
    const sum = data.reduce((accumulator, currentValue) => {
        const currentVal = parseInt(currentValue.amount)
        const commission = currentVal * 1.02 + 200;
        return accumulator + commission
      }, 0);

    return sum;
}

export const generateTransactionId = () => {
    const timestamp = Date.now(); // Current timestamp in milliseconds
    const randomNum = Math.floor(Math.random() * 1000000); // A random number between 0 and 999999
    return `mykT${timestamp}R${randomNum}`;
};

export const currentTime = () => {
    const now = new Date();
    const gmt3Time = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    
    // To account for DST, check the offset directly from the GMT+3 time object
    const gmt3Offset = gmt3Time.getTimezoneOffset() * 60 * 1000; // Convert minutes to milliseconds
    
    const adjustedTime = new Date(gmt3Time.getTime() + gmt3Offset);
    const datestr = adjustedTime.toLocaleString()

    return datestr;
}

export const deductBalanceFromUser = async ( totalAmount, user) => {
    const balance_object =  await getLastRecord(user);
      const current_balance_spent = balance_object.balance_spent;
      const current_balance = parseInt(balance_object.balance);
      const username = balance_object.user_email;
      const deductAmount = totalAmount;
       const updated_balance = current_balance - parseInt(deductAmount); 
       const values_balance_updated = [ updated_balance.toString(), deductAmount, username, current_balance_spent ]; 
       const sql_new_balance = 'INSERT INTO airtime_balance ( balance, deduct, user_email, balance_spent ) VALUES ( $1, $2, $3, $4 ) RETURNING *';
       await connect.query( sql_new_balance, values_balance_updated );

}

export const sendBulkSMS = async ( phoneNumbers, message ) => {

    try {
      const data =   {
        enqueue: true,
        username: process.env.ATX_USERNAME,
        senderId: 'INFORM',
        phoneNumbers: phoneNumbers,
        message: message,
      }

  
    const resp = await axios.post(process.env.AT_BULK_SMS_URL, data, 
      {headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'apiKey' : process.env.ATX_API_KEY
        }
      });


    return resp.data
    } catch (error) {
      console.log('The error occured sending sms is : ', error)
    }
    
}

export const isEmptyArray = ( arrayEntry ) => {

    if ( arrayEntry.length === 0 ) {
        return true
      } else {
        return false
      }
}

export const returnArrayFromText = ( text ) => {
    const arryText = text.split('*');
    return arryText.length 
};

export const returnValueFromArrayText = ( text, index ) => {
    const arryText = text.split('*');
    const value = arryText[index]
    return value;
}

export const selectDaraja = ( text ) => {
    switch ( text ) {
        case '2*1':
            return 'Daraja la juu'
        case '2*2':
            return 'Daraja la kati';
        case '2*3':
            return 'Daraja la kawaida';
        default:
            return 'Umekosea kuchagua daraja'
    }
}

export const convertDate = ( month ) => {
    
    const currentYear = new Date().getFullYear();
    switch ( month ) {
        case '1':
            return `Jan ${currentYear}`;
        case '2':
            return `Feb ${currentYear}`;
        case '3':
            return `March ${currentYear}`;
        case '4':
            return `April ${currentYear}`;
        case '5':
            return `May ${currentYear}`;
        case '6':
            return `June ${currentYear}`;
        case '7':
            return `July ${currentYear}`;
        case '8':
            return `Aug ${currentYear}`;
        case '9':
            return `Sept ${currentYear}`;
        case '10':
            return `Oct ${currentYear}`;
        case '11':
            return `Nov ${currentYear}`;
        case '12':
            return `Dec ${currentYear}`;
        default:
            return 'Invalid';
    }
}

export const updateTable = ( setcolumn, firstEntry, sessionId ) => {

    const sql = `UPDATE tomticket set ${setcolumn} = $1 WHERE session_id = $2`
    const values = [ firstEntry , sessionId ]
    connect.query( sql, values );
}

export const insertFirstEntry = ( number, sessionId, currentTim ) => {

    const sql_first_entry = 'INSERT INTO tomticket ( phone_number, session_id, entry_date  ) VALUES( $1, $2, $3 ) RETURNING *';
        const values_first_entry = [ number, sessionId, currentTim ];
        connect.query( sql_first_entry, values_first_entry )
}

