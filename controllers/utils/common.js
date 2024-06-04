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

export const generateTransactionId = () => {
    const timestamp = Date.now(); // Current timestamp in milliseconds
    const randomNum = Math.floor(Math.random() * 1000000); // A random number between 0 and 999999
    return `myk_${timestamp}_${randomNum}`;
}