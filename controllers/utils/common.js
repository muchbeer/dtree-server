import { getLastRecord } from "../../routes/common.js";
import connect from "../../config.js";

export const credentials = {
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME  };

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
