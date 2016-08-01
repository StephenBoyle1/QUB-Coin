var web3_extended = require('web3_ipc');
var SESSION_DURATION_IN_SEC = 600; // 10min

// CONNECT VIA RPC this way (only in DEV mode, as it is unsafe):
var options = {
  host: 'http://localhost:8545',
  ipc:false,
  personal: true,
  admin: true,
  debug: false
};

// CONNECT VIA IPC this way:
// var options = {
//   host: '/Users/username/Library/Ethereum/geth.ipc',
//   ipc:true,
//   personal: true,
//   admin: true,
//   debug: false
// };

var web3 = web3_extended.create(options);

var nodeInfo = web3.admin.nodeInfo(function(error,result){
  if(!error){
    console.log("Successfully established connectivity to the GETH node (Ethereum)");
  } else{
    console.log("Failed to connect to GETH node: %s", error);
  }
});

module.exports = {
    login: login,
    registerUser: registerNewAccount
};

function login(username, secret) {
  try{
    var authenticated = web3.personal.unlockAccount(username, secret, SESSION_DURATION_IN_SEC);
    if(authenticated){
      console.log("User [%s] has been successfully authenticated", username);
    } else {
      console.log("Failed to authenticate user [%s]", username);
    }
    return authenticated;
  } catch(err){
    // This will occur if you don't provide an existing username
    console.log("Error while authenticating user [%s], error: %s", username, err);
    return false;
  }
};

/**
  Creates a new account to the connected GETH node which will return the unique public address for that Ethereum wallet.
  TODO: we need to store the username within a dedicated contract in ethereum (not persisted anywhere just yet)
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
};
