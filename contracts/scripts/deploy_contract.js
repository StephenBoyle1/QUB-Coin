var solc = require('solc');
var Web3 = require('web3');
var fs = require('fs');
var web3 = new Web3();
var CREATOR = '0x9ec6e19e025e4bc7225758032585fb26ebf8de79';

console.log('=> Setting web3 provider to http://' + process.env.GETH_HOST);
web3.setProvider(new web3.providers.HttpProvider('http://' + process.env.GETH_HOST));

console.log('=> Reading contract stored within [sources/QUBCoin.sol]');
var contractSource = fs.readFileSync('sources/QUBCoin.sol', 'utf8');
console.log('=> Compiling contract stored within [sources/QUBCoin.sol]');
var compiledContractArray = solc.compile(contractSource, 1);
if(!compiledContractArray){
  console.log('=> Contract failed to compile...EXITING');
  process.exit(1);
}
var contractObject = compiledContractArray.contracts['QUBCoin'];
console.log('=> Contract Compiled successfully.');
var contractAbi = JSON.parse(contractObject.interface);
console.log('====== ABI START =====');
console.log(contractAbi);
console.log('====== ABI END =====');

console.log('=> Creating contract handle from ABI...');
var qubContractHandle = web3.eth.contract(contractAbi);
console.log('=> Broadcasting Contract to Geth...');
var qubContractInstance = qubContractHandle.new(
    {
        from: CREATOR,
        data: contractObject.bytecode,
        gas: 30000000
    }, function(err, contract){
        console.log(err, contract);
        if (typeof contract.address != 'undefined') {
            console.log('Contract mined! address: [' + contract.address + ']');
            createAndFundNewUserAccount(contract, 'Thor', 'student3@qub.ac.uk', 'test', true);
            createAndFundNewUserAccount(contract, 'The Hulk', 'student4@qub.ac.uk', 'test', true);
            createAndFundNewUserAccount(contract, 'Iron Man', 'student5@qub.ac.uk', 'test', true);
            createAndFundNewUserAccount(contract, 'Captain America', 'student6@qub.ac.uk', 'test', true);
        }
    }
);

function createAndFundNewUserAccount(contract, name, email, secret, isStudent) {
    var newAddr = web3.personal.newAccount(secret);
    console.log('--> Registering [%s] with [%s]', name, newAddr);
    var txnHash1 = web3.eth.sendTransaction({from:CREATOR, to:newAddr, value: web3.toWei(1, "ether")});
    console.log('--> Transaction hash for ether transfer = ' + txnHash1);
    var txnHash2 = contract.createUser(newAddr, email, name, isStudent, {from: CREATOR, gas:1000000});
    console.log('Transaction hash for user creation = ' + txnHash2);
}