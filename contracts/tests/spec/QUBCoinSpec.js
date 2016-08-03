describe("Basic QUBCoin test", function() {
  var GethWrapper = require('../lib/GethWrapper');
  var gethWrapper = new GethWrapper();
  var theContract;
  var theCreator;
  var FIRST_ACCOUNT = '0xb99ad90226f8e53f998334171f007a0191e07b7d';

  // The intent here is to deploy to contract only once for all the tests, but since
  // jasmine-node does not support the beforeAll method, we need to handle this one way or another...
  beforeEach(function(done) {
    // This is our 'workaround' to avoid recompiling/redeploying the contract
    if(!theContract) {
      console.log('INITIAL CONTRACT CREATION...')
      gethWrapper.createContract(function(qubCoinContract){
        theContract = qubCoinContract;
        theCreator = theContract.creator();
        done();
      });
    } else {
      console.log('CONTRACT ALREADY CREATED by [' + theCreator + ']')
      done();
    }
  });

  it("should have been deployed with 5 instructors", function() {
    console.log('Creator address = ' + theCreator);
    var numOfInstructors = parseInt(theContract.numInstructors());
    console.log('numOfInstructors = ' + numOfInstructors);

    expect(numOfInstructors).toEqual(5);
  });

  it("should be able to retrieve first instructor", function() {
    console.log('Creator address = ' + theCreator);
    var instructor = theContract.instructors(FIRST_ACCOUNT);
    console.log('Object of known account = ' + instructor);

    expect(instructor).toBeDefined();
    // There is no easy way to access the Instructor struct via named attribute,
    // as we are dealing a JSON array of primitive values rather than JSON Objects
    var accountId = instructor[0].toString();
    var email = instructor[1].toString();
    var name = instructor[2].toString();
    var coinBalance = parseInt(instructor[3]);

    expect(accountId).toEqual(FIRST_ACCOUNT);
    expect(email).toEqual('instructor1@qub.ac.uk');
    expect(name).toEqual('Instructor One');
    expect(coinBalance).toEqual(0);
  });

});
