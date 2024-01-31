import { transactionLog } from './types';


/**
 * Converts hex string to ascii.
 * @param hexString hex string.
 * @returns Ascii string converted from the str1 parameter.
 */
const hexToAscii = function (hexString: string) {
	var hex  = hexString.toString(); // forces conversion in case the parameter is not a string.
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substring(n, n+2), 16));
	}
	return str;
};

/**
 * Extends a simple message to a message that can be shown to the user.
 * @param message Message to convert.
 */

const extendMessage = function (message: string) {
    const messageMap: Record<string, string> = {
        'trade': 'Trade successfully executed.',
        'deposit': 'Deposit successfully executed.',
        'withdrawal': 'Withdrawal successfully executed.',
    };

    return messageMap[message] || message;
};
/**
 * Parses data field in log with string at the end (all in hex) and returns the corresponding message.
 */
const dataToMessage = function (data: string) {
    const hexString = data.slice(2);
    const n = Math.floor(hexString.length/64);
    // The number k indicates how many 32-characters-long blocks the message needs.
    const k = hexString[(n-3)*64] != '0' ? 3 : (hexString[(n-2)*64] != '0' ? 2 : 1);
    const listOfNumbers = Array.from(Array(n-k).keys()).map((j) => parseInt(hexString.slice(64*j, 64*(j+1)), 16));
    const stringLength = listOfNumbers[n-k-1];
    const stringOffset = listOfNumbers[n-k-2];
    const messageHex = hexString.slice(stringOffset*2+64,stringOffset*2+64+stringLength*2);
    const message = hexToAscii(messageHex);
    return extendMessage(message);
};

/**
 * Parses list of logs from a transaction and returns the corresponding message.
 */
const logsToMessage = function (logList: transactionLog[], poolAddress: string) {
    return logList
        .filter(log => log.address === poolAddress)
        .map(log => dataToMessage(log.data))
        .join('');
};

export { logsToMessage, dataToMessage, hexToAscii, extendMessage };
