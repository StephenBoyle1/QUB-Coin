var web3_extended = require('web3_ipc');
var SESSION_DURATION_IN_SEC = 600; // 10min
var NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

var QUB_COIN_ADDRESS = process.env.QUB_COIN_ADDRESS;
var GETH_HOST = process.env.GETH_HOST;

console.log("===> Using GETH_HOST: ", GETH_HOST);
console.log("===> Using QUB_COIN_ADDRESS: ", QUB_COIN_ADDRESS);

// CONNECT VIA RPC this way (only in DEV mode, as it is unsafe):
var options = {
    host: 'http://' + GETH_HOST,
    ipc:false,
    personal: true,
    admin: true,
    debug: false
};

var web3;     // The handle to Ethereum JSON-RPC API
var qubCoin;  // The Javascript object representing the QUBCoin smart-contract to interact with
var ethAuthenticatedAccount;

CoinTypeEnum = { Attendance: 0, Feedback: 1 };
UserTypeEnum = { Student: 0, Instructor: 1, Admin: 2 };
ClassTypeEnum = { Practical: 0, Lecture: 1 };
FeedbackRateEnum = { Excellent: 0, Good: 1, Average: 2, Poor: 3, NA: 4 };

connectToGeth();
initContract();

module.exports = {
    login: login,
    registerUser: registerUser,
    callGetInstructorList: callGetInstructorList,
    callGetStudentList: callGetStudentList,
    callGetUser: callGetUser
};

qubCoinContract = function(){
    return qubCoin;
};

web3Wrapper = function(){
    return web3;
};

authenticatedUserAddress = function(){
    return ethAuthenticatedAccount;
};

waitForTxnConfirmed = function(txnHash, callback){
    filter = web3Wrapper().eth.filter('latest');
    filter.watch(function(error, result) {
        var receipt = web3Wrapper().eth.getTransactionReceipt(txnHash);
        if (receipt && receipt.transactionHash == txnHash) {
            console.log('Transaction [%s] confirmed!', txnHash);
            filter.stopWatching();
            callback(null, txnHash);
        }
    });
};

/**
 * Initialization of GETH client and checking connectivity
 */
function connectToGeth(){
    web3 = web3_extended.create(options);
    var gethConnected = web3.isConnected();
    if(gethConnected){
        console.log("Successfully established connectivity to the GETH node (Ethereum)");
    } else{
        console.log('Failed to connect to GETH node. You specified [%s] for your GETH_HOST. Expecting <HOST>:<PORT>, like localhost:8545 for instance', GETH_HOST);
    }
}

/**
 * Internal method called at start-up time only, which effectively allows interactions with a smart contract
 */
function initContract(){
    if(!QUB_COIN_ADDRESS || QUB_COIN_ADDRESS == ''){
        console.error("****** Missing QUB_COIN_ADDRESS environment Variable: THIS IS A MUST for running this application, please restart with appropriate contract address ******");
    } else {
        unlockMasterAccount();
        console.log('=> eth.defaultAccount = ' + web3.eth.defaultAccount);
        var qubCoinAbi = [{"constant":false,"inputs":[{"name":"_classId","type":"address"},{"name":"secret","type":"bytes32"}],"name":"setClassSecret","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"creator","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"_index","type":"uint256"}],"name":"getTransferAtIndex","outputs":[{"name":"isDebit","type":"bool"},{"name":"sender","type":"address"},{"name":"receiver","type":"address"},{"name":"qubClass","type":"address"},{"name":"coinType","type":"uint8"},{"name":"amount","type":"uint256"},{"name":"feedbackRate","type":"uint8"},{"name":"timeStamp","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"classesAddresses","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"instructorsAddresses","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"accountId","type":"address"},{"name":"email","type":"bytes32"},{"name":"name","type":"bytes32"},{"name":"userType","type":"uint8"}],"name":"createUser","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_classId","type":"address"},{"name":"_secret","type":"bytes32"}],"name":"logAttendance","outputs":[{"name":"error","type":"uint16"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"classes","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_classId","type":"address"},{"name":"_feedbackPoints","type":"uint256"},{"name":"_feedbackRate","type":"uint8"}],"name":"sendFeedback","outputs":[{"name":"error","type":"uint16"}],"type":"function"},{"constant":true,"inputs":[{"name":"_classId","type":"address"}],"name":"getClassAtAddress","outputs":[{"name":"instructor","type":"address"},{"name":"name","type":"bytes32"},{"name":"location","type":"bytes32"},{"name":"startTime","type":"bytes32"},{"name":"duration","type":"uint8"},{"name":"date","type":"bytes32"},{"name":"theClassType","type":"uint8"},{"name":"classAddress","type":"address"},{"name":"attendanceReward","type":"uint256"},{"name":"numOfStudents","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"numOfInstructors","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_studentIds","type":"address[]"},{"name":"_classId","type":"address"}],"name":"enrollStudentsToClass","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"_accountId","type":"address"},{"name":"_index","type":"uint256"}],"name":"getClassAtIndex","outputs":[{"name":"instructor","type":"address"},{"name":"name","type":"bytes32"},{"name":"location","type":"bytes32"},{"name":"startTime","type":"bytes32"},{"name":"duration","type":"uint8"},{"name":"date","type":"bytes32"},{"name":"theClassType","type":"uint8"},{"name":"classAddress","type":"address"},{"name":"attendanceReward","type":"uint256"},{"name":"numOfStudents","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"numOfStudents","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"users","outputs":[{"name":"accountId","type":"address"},{"name":"email","type":"bytes32"},{"name":"name","type":"bytes32"},{"name":"attendanceBalance","type":"uint256"},{"name":"feedbackBalance","type":"uint256"},{"name":"userType","type":"uint8"},{"name":"numOfClasses","type":"uint256"},{"name":"numOfTransfers","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_instructor","type":"address"},{"name":"_name","type":"bytes32"},{"name":"_location","type":"bytes32"},{"name":"_startTime","type":"bytes32"},{"name":"_duration","type":"uint8"},{"name":"_date","type":"bytes32"},{"name":"_classType","type":"uint8"}],"name":"createClass","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"registeredEmails","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[],"name":"numOfClasses","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"studentsAddresses","outputs":[{"name":"","type":"address"}],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"error","type":"uint16"},{"indexed":true,"name":"senderId","type":"address"},{"indexed":true,"name":"classId","type":"address"}],"name":"FeedbackSentEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"error","type":"uint16"},{"indexed":true,"name":"senderId","type":"address"},{"indexed":true,"name":"classId","type":"address"}],"name":"AttendanceLoggedEvent","type":"event"}];

        var qubCoinHandle = web3.eth.contract(qubCoinAbi);
        qubCoin = qubCoinHandle.at(QUB_COIN_ADDRESS);
        console.log("Instantiated contract successfully at [%s]", QUB_COIN_ADDRESS);
        var numOfIns = qubCoin.numOfInstructors();
        console.log("Number of instructors in contract = ", numOfIns.toString());
        var numOfStudents = qubCoin.numOfStudents();
        console.log("Number of students in contract = ", numOfStudents.toString());
        console.log('===> List of instructors=', callGetInstructorList());
        console.log('===> List of students=', callGetStudentList());
    }
}

function unlockMasterAccount(){
    web3.eth.defaultAccount = web3.eth.accounts[0];
    if(web3.personal.unlockAccount(web3.eth.defaultAccount, 'test', SESSION_DURATION_IN_SEC * 10)){
        console.log("Master ETH account unlocked OK [%s]", web3.eth.defaultAccount);
    } else{
        console.log("Failed to unlock Master ETH account [%s]", web3.eth.defaultAccount);
    }
}

/**
 * Attempts to authenticate a user based on ethereum address and password (will change to take an email, once smart-contract is ready)
 *
 * @param username The username to be authenticated
 * @param secret   Password for that username
 *
 * @returns user: object with all required user details if authenticated successfully, else null
 */
function login(username, secret) {
    try {
        ethAuthenticatedAccount = null;
        var userAddress = registeredAddressFor(username);
        
        console.log("registeredAddressFor(%s) is: [%s]", username, userAddress);
        
        if(userAddress){
            if(web3.personal.unlockAccount(userAddress, secret, SESSION_DURATION_IN_SEC)){
                var user = callGetUser(userAddress);
                if(user && user.accountId != NULL_ADDRESS){
                    console.log("User [%s] has been successfully authenticated", user.email);
                    ethAuthenticatedAccount = user.accountId;
                    return user;
                }
            } else {
                console.log("Failed to authenticate user [%s]", username);
                return null;
            }
        } else {
            console.log("User [%s] us unknown to the system", username);
            return null;
        }

    } catch(err) {
        // This will occur if you don't provide an existing username
        console.log("Error while authenticating user [%s], error: %s", username, err);
        return null;
    }
}

function registeredAddressFor(username) {
    var theAddress = qubCoin.registeredEmails(username).toString();
    if(theAddress != NULL_ADDRESS){
        return theAddress;
    } else {
        return null;
    }
}

/**
 * Creates a new account to the connected GETH node which will return the unique public address for that Ethereum wallet.
 * Then associate that new account with a user within the QUBCoin smart contract with the provided details
 *
 * @param name      The name of the user to be registered
 * @param email     The email of the user to be registered
 * @param secret    The password associated to the ethereum wallet account which will allow the unlocking of the account and subsequently signing transactions
 * @param userType  The UserTypeEnum as either Student or Instructor (Admin shouldn't be used)
 * @param callback  The callback method to invoke to give control back to the caller
 * 
 * @returns The newly created account and user details as Json object
 */
function registerUser(name, email, secret, userType, callback) {
    try{
        //first check that this email hasn't been registered already:
        var userAddress = registeredAddressFor(email);
        if(userAddress && userAddress != NULL_ADDRESS){
            return callGetUser(userAddress);
        } else{
            var newAddress = web3.personal.newAccount(secret);
            console.log("Created new eth account for user [%s], with address: %s", name, newAddress);

            var txnHash = qubCoin.createUser(newAddress, email, name, userType,
                {from: web3.eth.accounts[0], gas:1000000});
            console.log("createUser transaction sent: " + txnHash);

            waitForTxnConfirmed(txnHash, function(error, data){
                // Fund some ether to new account so it can interact/invoke the smart-contract
                var txnHash2 = web3.eth.sendTransaction({
                    from: web3.eth.accounts[0],
                    to:newAddress,
                    value: web3.toWei(1, "ether")}
                );

                console.log('--> Transaction hash for ether transfer = ' + txnHash2);

                callback(null, {
                    accountId: newAddress,
                    email: email,
                    name: name,
                    attendanceBalance: 0,
                    feedbackBalance: 0,
                    userType: userType
                });
            });
        }
    } catch(error){
        console.log("Failed to Create new account for username [%s], error: %s", username, error);
        throw error;
    }
}

function parseUserType(rawUserType) {
    if(parseInt(rawUserType) == 0){
        return UserTypeEnum.Student;
    } else if(parseInt(rawUserType) == 1){
        return UserTypeEnum.Instructor;
    } else {
        return UserTypeEnum.Admin;
    }
}


/**
 * This method actually calls the ethereum-hosted smart contract and invokes the exposed "users" mapping, which is keyed via address
 *
 * @param forAddress The address used for the look-up of the users mapping/array
 *
 * @returns
 * {
 *  accountId: string,
 *  email: string,
 *  name: string,
 *  attendanceBalance: Number,
 *  feedbackBalance: Number,
 *  userType: UserTypeEnum,
 *  numOfClasses: Number
 * }
 */
function callGetUser(forAddress){
    var user = qubCoin.users(forAddress);

    return {
        accountId: user[0].toString(),
        email: web3.toUtf8(user[1]),
        name: web3.toUtf8(user[2]),
        attendanceBalance: parseInt(user[3]),
        feedbackBalance: parseInt(user[4]),
        userType: parseUserType(user[5]),
        numOfClasses: parseInt(user[6]),
        numOfTransfers: parseInt(user[7])
    };
}

/**
 * This method actually calls the ethereum-hosted smart contract and invokes the exposed "users" and "instructorsAddresses" mappings
 *
 * @returns an array of {{accountId: string, email: string, name: string, attendanceBalance: Number, feedbackBalance: Number, isStudent: boolean}}
 */
function callGetInstructorList(){
    var instructorsCount = qubCoin.numOfInstructors();
    var instructorList = [];

    for(var index=1; index <= instructorsCount; index++){
        console.log("qubCoin.instructorsAddresses(%s)=[%s]", index, qubCoin.instructorsAddresses(index));
        instructorList.push(callGetUser(qubCoin.instructorsAddresses(index)));
    }
    return instructorList;
}

/**
 * This method actually calls the ethereum-hosted smart contract and invokes the exposed "users" and "studentsAddresses" mappings
 *
 * @returns an array of {{accountId: string, email: string, name: string, attendanceBalance: Number, feedbackBalance: Number, isStudent: boolean}}
 */
function callGetStudentList(){
    var studentsCount = qubCoin.numOfStudents();
    var studentList = [];

    for(var index=1; index <= studentsCount; index++){
        studentList.push(callGetUser(qubCoin.studentsAddresses(index)));
    }
    return studentList;
}