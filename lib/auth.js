var web3_extended = require('web3_ipc');
var SESSION_DURATION_IN_SEC = 600; // 10min

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
    var qubCoinAbi = [{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"instructorsAddresses","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"instructors","outputs":[{"name":"accountId","type":"address"},{"name":"email","type":"bytes32"},{"name":"name","type":"bytes32"},{"name":"coinBalance","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"numOfInstructors","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"numOfStudents","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"students","outputs":[{"name":"accountId","type":"address"},{"name":"email","type":"bytes32"},{"name":"name","type":"bytes32"},{"name":"attendanceBalance","type":"uint256"},{"name":"coinBalance","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"registeredEmails","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"studentsAddresses","outputs":[{"name":"","type":"address"}],"type":"function"},{"inputs":[],"type":"constructor"}];
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
    registerUser: registerNewAccount
};

/**
 * Attempts to authenticate a user based on ethereum address and password (will change to take an email, once smart-contract is ready)
 *
 * @param username The username to be authenticated
 * @param secret   Password for that username
 *
 * @returns boolean: true if authenticated successfully, else false
 */
function login(username, secret) {
  try {
    var authenticated = web3.personal.unlockAccount(username, secret, SESSION_DURATION_IN_SEC);
    if(authenticated){
      console.log("User [%s] has been successfully authenticated", username);
      console.log(callGetInstructor(username));
    } else {
      console.log("Failed to authenticate user [%s]", username);
    }
    return authenticated;
  } catch(err) {
    // This will occur if you don't provide an existing username
    console.log("Error while authenticating user [%s], error: %s", username, err);
    return false;
  }
}


/**
 * Creates a new account to the connected GETH node which will return the unique public address for that Ethereum wallet.
 * TODO: we need to store the username within a dedicated contract in ethereum (not persisted anywhere just yet)
 *
 * @param username The new username for which we want to register a new account
 * @param secret   The password associated to the ethereum wallet account which will allow the unlocking of the account and subsequently signing transactions
 *
 * @returns The public address representing the public key of the newly created account
 */
function registerNewAccount(username, secret) {
  try{
    var accountAddress = web3.personal.newAccount(secret);

    //TODO: call the QubCoin contract to register new user here

    console.log("Created new account for username [%s], with address: %s", username, accountAddress);
    return accountAddress;
  } catch(error){
    console.log("Failed to Create new account for username [%s], error: %s", username, error);
    throw error;
  }
}

/**
 * This method actually calls the ethereum-hosted smart contract and invokes the exposed "instructors" mapping, which is keyed via address
 *
 * @param forAddress The address used for the look-up of the instructors mapping/array
 *
 * @returns {{accountId: string, email: string, name: string, coinBalance: Number}}
 */
function callGetInstructor(forAddress){
  var instructor = qubCoin.instructors(forAddress);

  return {
    accountId: instructor[0].toString(),
    email: web3.toUtf8(instructor[1]),
    name: web3.toUtf8(instructor[2]),
    coinBalance: parseInt(instructor[3])
  };
}

/**
 * This method actually calls the ethereum-hosted smart contract and invokes the exposed "instructors" mapping, which is keyed via address
 *
 * @param forAddress The address used for the look-up of the instructors mapping/array
 *
 * @returns {{accountId: string, email: string, name: string, coinBalance: Number}}
 */
function callGetInstructorList(){
  var instructorsCount = qubCoin.numOfInstructors();
  var instructorList = [];

  for(index=0; index<instructorsCount; index++){
    instructorList.push(callGetInstructor(qubCoin.instructorsAddresses(index)));
  }
  return instructorList;
}