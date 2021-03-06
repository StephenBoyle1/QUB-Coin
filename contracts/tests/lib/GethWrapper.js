var solc = require('solc');
var Web3 = require('web3');
var FileHelper = require('./FileHelper.js');
var web3 = new Web3();
var fileHelper = new FileHelper();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8546')); //We are running testRPC on port 8546

/////////////////////////////////////////////////////////////////////////////
// This module abstract the web3 calls for the Jasmine's Specs file
/////////////////////////////////////////////////////////////////////////////
function GethWrapper(){
}

/////////////////////////////////////////////////////////////////////////////
// Compiles the contract from source file and broadcast it to the local geth
// TestRPC node in an asynchronously manner (the callback method)
/////////////////////////////////////////////////////////////////////////////
GethWrapper.prototype.createContract = function(callback){
  console.log('=> Compiling contract stored within [QUBCoin.sol]');
  var contractSource = fileHelper.readFile('QUBCoin.sol');
  var contractCompiled = solc.compile(contractSource, 1)
  if (contractCompiled.contracts === undefined){
    console.log("ERROR: Contract did not compile successfully, exiting.")
    process.exit();
  }
  var contractObject = contractCompiled.contracts['QUBCoin'];
  console.log('=> Compiled successfully.');
  var contractAbi = JSON.parse(contractObject.interface);
  var contractInstance = web3.eth.contract(contractAbi);
  var fromAccount = web3.eth.accounts[0];

  console.log('=> Deploying contract to local TestRPC geth Node...');
  var theContract = contractInstance.new({
    from: fromAccount,
    data: contractObject.bytecode,
    gas: 4712388
  }, function(e, contract) {
    console.log(e, contract);
    if (typeof contract.address != 'undefined') {
      console.log('==> Contract mined! address: [' + contract.address + '], transactionHash: [' + contract.transactionHash + '] <==');
      callback(contract);
    }
  });
}

/////////////////////////////////////////////////////////////////////////////
// Avoid spec code to have to rely on web3: this method returns the account
// address stored at the provided index
/////////////////////////////////////////////////////////////////////////////
GethWrapper.prototype.getEthAccount = function(index) {
  return web3.eth.accounts[index];
};

GethWrapper.prototype.bytesToString = function(rawBytes){
  return web3.toUtf8(rawBytes);
};

GethWrapper.prototype.waitForTxnConfirmed = function(txnHash, callback){
  filter = web3.eth.filter('latest');
  filter.watch(function(error, result) {
    var receipt = web3.eth.getTransactionReceipt(txnHash);
    if (receipt && receipt.transactionHash == txnHash) {
      console.log('Transaction [%s] confirmed!', txnHash);
      filter.stopWatching();
      callback(null, txnHash);
    }
  });
};

module.exports = GethWrapper;
