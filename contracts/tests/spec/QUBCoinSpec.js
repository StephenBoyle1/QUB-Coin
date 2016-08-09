describe("Basic QUBCoin test", function() {
  var GethWrapper = require('../lib/GethWrapper');
  var gethWrapper = new GethWrapper();
  var theContract;
  var FIRST_ACCOUNT = '0xb99ad90226f8e53f998334171f007a0191e07b7d';
  var THIRD_ACCOUNT = '0xd618d80432d9f3c3805409e20cd4e66714a6a1e7';

  // The intent here is to deploy to contract only once for all the tests, but since
  // jasmine-node does not support the beforeAll method, we need to handle this one way or another...
  beforeEach(function(done) {
    // This is our 'workaround' to avoid recompiling/redeploying the contract
    if(!theContract) {
      console.log('INITIAL CONTRACT CREATION...');
      gethWrapper.createContract(function(qubCoinContract){
        theContract = qubCoinContract;
        done();
      });
    } else {
      console.log('CONTRACT ALREADY CREATED');
      done();
    }
  });

  it("should have been deployed with 2 instructors and 3 students", function() {
    var numOfInstructors = parseInt(theContract.numOfInstructors());
    console.log('numOfInstructors = ' + numOfInstructors);
    var numOfStudents = parseInt(theContract.numOfStudents());
    console.log('numOfStudents = ' + numOfStudents);

    expect(numOfInstructors).toEqual(2);
    expect(numOfStudents).toEqual(3);
  });

  it("should be able to retrieve first instructor", function() {
    var instructor = theContract.users(FIRST_ACCOUNT);
    console.log('Object of known account = ' + instructor);

    expect(instructor).toBeDefined();
    // There is no easy way to access the Instructor struct via named attribute,
    // as we are dealing a JSON array of primitive values rather than JSON Objects
    var accountId = instructor[0].toString();
    var email = gethWrapper.bytesToString(instructor[1]);
    var name = gethWrapper.bytesToString(instructor[2]);
    var attendanceBalance = parseInt(instructor[3]);
    var feedbackBalance = parseInt(instructor[4]);
    var isStudent = instructor[5];

    expect(accountId).toEqual(FIRST_ACCOUNT);
    expect(email).toEqual('instructor1@qub.ac.uk');
    expect(name).toEqual('Kim Bauters');
    expect(attendanceBalance).toEqual(0);
    expect(feedbackBalance).toEqual(0);
    expect(isStudent).toEqual(false);
  });

  it("should be able to retrieve first student", function() {
    var student = theContract.users(THIRD_ACCOUNT);
    console.log('Object of known account = ' + student);

    expect(student).toBeDefined();
    // There is no easy way to access the Student struct via named attribute,
    // as we are dealing a JSON array of primitive values rather than JSON Objects
    var accountId = student[0].toString();
    var email = gethWrapper.bytesToString(student[1]);
    var name = gethWrapper.bytesToString(student[2]);
    var attendanceBalance = parseInt(student[3]);
    var feedbackBalance = parseInt(student[4]);
    var isStudent = student[5];

    expect(accountId).toEqual(THIRD_ACCOUNT);
    expect(email).toEqual('student1@qub.ac.uk');
    expect(name).toEqual('Linzi Roberts');
    expect(attendanceBalance).toEqual(0);
    expect(feedbackBalance).toEqual(0);
    expect(isStudent).toEqual(true);
  });

  it("should be able to access studentAddresses mapping", function() {
    var studentAddr1 = theContract.studentsAddresses(0);
    console.log('Object of registered address = ' + studentAddr1);
    var student = theContract.users(studentAddr1);
    expect(student[5]).toEqual(true);
  });

  it("should be able to access student details via their emailAddress", function() {
    var studentAddr1 = theContract.registeredEmails('student1@qub.ac.uk');
    console.log('registered address for student1 = ' + studentAddr1);
    var student = theContract.users(studentAddr1);
    expect(student[0].toString()).toEqual(studentAddr1);
    expect(student[0].toString()).toEqual(THIRD_ACCOUNT);
    expect(student[5]).toEqual(true);
  });

});
