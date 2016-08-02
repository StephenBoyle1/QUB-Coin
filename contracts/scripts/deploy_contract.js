var solc = require('solc');
var Web3 = require('web3');
var fs = require('fs');
var web3 = new Web3();

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
        from: web3.eth.accounts[0],
        data: contractObject.bytecode,
        gas: 3000000
    }, function(err, contract){
        console.log(err, contract);
        if (typeof contract.address != 'undefined') {
            console.log('Contract mined! address: [' + contract.address + ']');
        }
    }
)
