var web3_extended = require('web3_ipc');
var SESSION_DURATION_IN_SEC = 600; // 10min
var NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

// TODO: this hard-coded address needs to be manually changed everytime a new version of the contract is deployed:
// instead we could feed that from the docker-compose.yml file once we have "dockerized the app"
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

connectToGeth();
initContract();

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
    web3.eth.defaultAccount = web3.eth.accounts[0];
    console.log('=> eth.defaultAccount = ' + web3.eth.defaultAccount);
    var qubCoinAbi = [{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"instructorsAddresses","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[],"name":"numOfInstructors","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"numOfStudents","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"users","outputs":[{"name":"accountId","type":"address"},{"name":"email","type":"bytes32"},{"name":"name","type":"bytes32"},{"name":"attendanceBalance","type":"uint256"},{"name":"feedbackBalance","type":"uint256"},{"name":"isStudent","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"registeredEmails","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"studentsAddresses","outputs":[{"name":"","type":"address"}],"type":"function"},{"inputs":[],"type":"constructor"}]

    var qubCoinHandle = web3.eth.contract(qubCoinAbi);
    qubCoin = qubCoinHandle.at(QUB_COIN_ADDRESS);
    console.log("Instantiated contract successfully at [%s]", QUB_COIN_ADDRESS);
    var numOfIns = qubCoin.numOfInstructors();
    console.log("Number of instructors in contract = ", numOfIns.toString());
    var numOfStudents = qubCoin.numOfStudents();
    console.log("Number of students in contract = ", numOfStudents.toString());
    console.log('===> List of instructors=', callGetInstructorList());
  }
}

module.exports = {
    login: login,
    registerUser: registerUser
};

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
    var userAddress = registeredAddressFor(username);
    if(userAddress){
      if(web3.personal.unlockAccount(userAddress, secret, SESSION_DURATION_IN_SEC)){
        var user = callGetUser(userAddress);
        if(user.accountId != NULL_ADDRESS){
          console.log("User [%s] has been successfully authenticated", user.email);
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
 * @param isStudent True if this is a student registration, false if it is for an instructor
 *
 * @returns The newly created account and user details as Json object
 */
function registerUser(name, email, secret, isStudent) {
  try{
    //first check that this email hasn't been registered already:
    var userAddress = registeredAddressFor(email);
    if(userAddress){
      return callGetUser(userAddress);
    } else{
      var accountAddress = web3.personal.newAccount(secret);
      console.log("Created new eth account for user [%s], with address: %s", name, accountAddress);

      //TODO: create user in contract properly...for now returning object directly
      return {
        accountId: accountAddress,
        email: email,
        name: name,
        attendanceBalance: 0,
        feedbackBalance: 0,
        isStudent: isStudent
      };
    }
  } catch(error){
    console.log("Failed to Create new account for username [%s], error: %s", username, error);
    throw error;
  }
}

/**
 * This method actually calls the ethereum-hosted smart contract and invokes the exposed "users" mapping, which is keyed via address
 *
 * @param forAddress The address used for the look-up of the users mapping/array
 *
 * @returns {{accountId: string, email: string, name: string, attendanceBalance: Number, feedbackBalance: Number, isStudent: boolean}}
 */
function callGetUser(forAddress){
  var user = qubCoin.users(forAddress);

  return {
    accountId: user[0].toString(),
    email: web3.toUtf8(user[1]),
    name: web3.toUtf8(user[2]),
    attendanceBalance: parseInt(user[3]),
    feedbackBalance: parseInt(user[4]),
    isStudent: user[5]
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

  for(index=0; index<instructorsCount; index++){
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

  for(index=0; index<studentsCount; index++){
    studentList.push(callGetUser(qubCoin.studentsAddresses(index)));
  }
  return studentList;
}