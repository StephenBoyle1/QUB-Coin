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
        gas: 50000000,
        gasprice: 100000
    }, function(err, contract){
        console.log(err, contract);
        if (typeof contract.address != 'undefined') {
            console.log('Contract mined! address: [' + contract.address + ']');
            createAndFundNewUserAccount(contract, 'Thor', 'student3@qub.ac.uk', 'test', 0);  // 0 for student
            createAndFundNewUserAccount(contract, 'The Hulk', 'student4@qub.ac.uk', 'test', 0);
            createAndFundNewUserAccount(contract, 'Iron Man', 'student5@qub.ac.uk', 'test', 0);
            createAndFundNewUserAccount(contract, 'Captain America', 'student6@qub.ac.uk', 'test', 0);
            enrollStudentsToNewClass(contract, function(){console.log("DONE!")});
        }
    }
);

function createAndFundNewUserAccount(contract, name, email, secret, userType) {
    var newAddr = web3.personal.newAccount(secret);
    console.log('--> Registering [%s] with [%s]', name, newAddr);
    var txnHash1 = web3.eth.sendTransaction({from:CREATOR, to:newAddr, value: web3.toWei(1, "ether")});
    console.log('--> Transaction hash for ether transfer = ' + txnHash1);
    var txnHash2 = contract.createUser(newAddr, email, name, userType, {from: CREATOR, gas:1000000});
    console.log('Transaction hash for user creation = ' + txnHash2);
}

function enrollStudentsToNewClass(contract, callback){
    try{
        console.log('Creating class...');
        var txnHash = contract.createClass('0x54fe03c5df044aadbb7b1d17198916f907c22b24',
            'Networking', 'Room 1', '09:00', 1, '10/10/2016', 0, {from: CREATOR, gas:1000000}, function(err, data){
                if(err){
                    console.log("Problem creating class: " + err);
                    callback(err, null);
                } else {
                    console.log("Created class successfully via txn [%s]", data);
                    waitForTxnConfirmed(data, function(){
                        enrollStudents(contract, callback)
                    });
                }
            });
    } catch(error){
        console.log('error = ' + error);
    }
}

function enrollStudents(contract, callback) {
    var st1 = '0x51adcda2c9b234853498efd83903cf250175ca40';
    var st2 = '0x9ec6e19e025e4bc7225758032585fb26ebf8de79';

    var thisClassAddress = contract.classesAddresses(1);
    console.log('thisClassAddress = ' + thisClassAddress);
    
    var txnHash2 = contract.enrollStudentsToClass([st1, st2], thisClassAddress, {from: CREATOR, gas:1000000}, function(err, data) {
        if (err) {
            console.log("Problem enrolling to class: " + err);
            callback(err, null);
        } else {
            console.log("Enrolled to class successfully via txn [%s]", data);
            waitForTxnConfirmed(data, function () {
                var user1 = contract.users(st1);
                console.log('student 1 Data = ' + user1);

                var user2 = contract.users(st2);
                console.log('student 2 Data = ' + user2);
                
                logAttendanceFor(contract, st1, thisClassAddress, callback);
            });
        }
    });
}

function logAttendanceFor(contract, student, classId, callback) {
    var txnHash2 = contract.logAttendance(classId, 'qubsecret', {from: student, gas:1000000}, function(err, data) {
        if (err) {
            console.log("Problem logging attendance to class: " + err);
            callback(error, null);
        } else {
            console.log("Logged attendance successfully via txn [%s]", data);
            waitForTxnConfirmed(data, callback);
        }
    });
}

waitForTxnConfirmed = function(txnHash, callback){
    var filter = web3.eth.filter('latest');
    filter.watch(function(error, result) {
        var receipt = web3.eth.getTransactionReceipt(txnHash);
        if (receipt && receipt.transactionHash == txnHash) {
            console.log('Transaction [%s] confirmed!', txnHash);
            filter.stopWatching();
            callback();
        }
    });
};