describe("Basic QUBCoin test", function() {
  var GethWrapper = require('../lib/GethWrapper');
  var gethWrapper = new GethWrapper();
  var theContract;
  var FIRST_INSTRUCTOR_ADDR = '0x54fe03c5df044aadbb7b1d17198916f907c22b24';
  var FIRST_STUDENT_ADDR = '0x51adcda2c9b234853498efd83903cf250175ca40';

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

  it("should have been deployed with 2 instructors and 2 students", function() {
    var numOfInstructors = parseInt(theContract.numOfInstructors());
    console.log('numOfInstructors = ' + numOfInstructors);
    var numOfStudents = parseInt(theContract.numOfStudents());
    console.log('numOfStudents = ' + numOfStudents);

    expect(numOfInstructors).toEqual(2);
    expect(numOfStudents).toEqual(2);
  });

  it("should be able to retrieve first instructor", function() {
    var instructor = theContract.users(FIRST_INSTRUCTOR_ADDR);
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

    expect(accountId).toEqual(FIRST_INSTRUCTOR_ADDR);
    expect(email).toEqual('instructor1@qub.ac.uk');
    expect(name).toEqual('Kim Bauters');
    expect(attendanceBalance).toEqual(0);
    expect(feedbackBalance).toEqual(0);
    expect(isStudent).toEqual(false);
  });

  it("should be able to retrieve first student", function() {
    var student = theContract.users(FIRST_STUDENT_ADDR);
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
    var isAdmin = student[6];

    expect(accountId).toEqual(FIRST_STUDENT_ADDR);
    expect(email).toEqual('student1@qub.ac.uk');
    expect(name).toEqual('Linzi Roberts');
    expect(attendanceBalance).toEqual(0);
    expect(feedbackBalance).toEqual(0);
    expect(isStudent).toEqual(true);
    expect(isAdmin).toEqual(false);
  });

  it("should be able to access studentAddresses mapping", function() {
    var studentAddr1 = theContract.studentsAddresses(1);
    console.log('Object of registered address = ' + studentAddr1);
    var student = theContract.users(studentAddr1);
    expect(student[5]).toEqual(true);
  });

  it("should be able to access student details via their emailAddress", function() {
    var studentAddr1 = theContract.registeredEmails('student1@qub.ac.uk');
    console.log('registered address for student1 = ' + studentAddr1);
    var student = theContract.users(studentAddr1);
    expect(student[0].toString()).toEqual(studentAddr1);
    expect(student[0].toString()).toEqual(FIRST_STUDENT_ADDR);
    expect(student[5]).toEqual(true);
    expect(student[6]).toEqual(false); // Not admin
  });

  it("should be able to create New user as student", function() {
    var newStudentAddr = gethWrapper.getEthAccount(0);
    console.log('==> newStudentAddr = ' + newStudentAddr);
    var txnHash = theContract.createUser(newStudentAddr, 'email@test.com', 'Student Test1', true, {from: newStudentAddr});
    console.log('Transaction hash for Student creation = ' + txnHash);

    expect(txnHash).toBeDefined();

    var student = theContract.users(newStudentAddr);
    expect(student).toBeDefined();
    expect(student[0].toString()).toEqual(newStudentAddr);
    expect(gethWrapper.bytesToString(student[1])).toEqual('email@test.com');
    expect(gethWrapper.bytesToString(student[2])).toEqual('Student Test1');
    expect(parseInt(student[3])).toEqual(0);
    expect(parseInt(student[4])).toEqual(0);
    expect(student[5]).toEqual(true);
    expect(student[6]).toEqual(false); // Not admin
    expect(parseInt(student[7])).toEqual(0); // numOfClasses
  });

  it("should be able to create New user as instructor", function() {
    var newInstructorAddr = gethWrapper.getEthAccount(1);
    var txnHash = theContract.createUser(newInstructorAddr, 'email2@test.com', 'Instructor Test1', false, {from: newInstructorAddr});
    console.log('Transaction hash for instructor creation = ' + txnHash);

    expect(txnHash).toBeDefined();

    var instructor = theContract.users(newInstructorAddr);
    expect(instructor).toBeDefined();
    expect(instructor[0].toString()).toEqual(newInstructorAddr);
    expect(gethWrapper.bytesToString(instructor[1])).toEqual('email2@test.com');
    expect(gethWrapper.bytesToString(instructor[2])).toEqual('Instructor Test1');
    expect(parseInt(instructor[3])).toEqual(0);
    expect(parseInt(instructor[4])).toEqual(0);
    expect(instructor[5]).toEqual(false);
    expect(instructor[6]).toEqual(false); // Not admin
    expect(parseInt(instructor[7])).toEqual(0); // numOfClasses
  });

  it("should be able to create New class for given instructor and retrieve it", function() {
    var newInstructorAddr = gethWrapper.getEthAccount(2);
    var txnHash1 = theContract.createUser(newInstructorAddr, 'email3@test.com', 'Instructor Test2', false, {from: newInstructorAddr, gas: 3000000});
    console.log('Transaction hash for user creation = ' + txnHash1);
    var txnHash2 = theContract.createClass(newInstructorAddr, "Networks", "Room 1", "09:00", 1, "20/09/2016", "lecture", {from: newInstructorAddr, gas: 3000000});
    console.log('Transaction hash for class creation = ' + txnHash2);
    
    expect(txnHash1).toBeDefined();
    expect(txnHash2).toBeDefined();
    
    var instructor = theContract.users(newInstructorAddr);
    expect(instructor).toBeDefined();
    expect(parseInt(instructor[7])).toEqual(1); // numOfClasses to be set to 1

    // Check that overall numOfClasses has been incremented to 1:
    expect(parseInt(theContract.numOfClasses())).toEqual(1);
    
    theContract.getClassAtIndex(newInstructorAddr, 1, function (error, data) {
      if (error) {
        console.log("error=" + error);
        expect(error).toBeNotDefined();
      }

      expect(data).toBeDefined();
      console.log(" ************** DATA = " + data);
      expect(data[0].toString()).toEqual(newInstructorAddr);
      expect(gethWrapper.bytesToString(data[1])).toEqual("Networks");
      expect(gethWrapper.bytesToString(data[2])).toEqual("Room 1");
      expect(gethWrapper.bytesToString(data[3])).toEqual("09:00");
      expect(parseInt(data[4])).toEqual(1);
      expect(gethWrapper.bytesToString(data[5])).toEqual("20/09/2016");
      expect(gethWrapper.bytesToString(data[6])).toEqual("lecture");
      expect(data[7].toString()).toEqual(theContract.classesAddresses(1)); // Check that the address of the Class matches the address within the dedicated Mapping for classes addresses
    });
  });

});
