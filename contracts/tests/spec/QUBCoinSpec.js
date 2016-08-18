describe("Basic QUBCoin test", function() {
  var GethWrapper = require('../lib/GethWrapper');
  var gethWrapper = new GethWrapper();
  var theContract;
  var FIRST_INSTRUCTOR_ADDR = '0x54fe03c5df044aadbb7b1d17198916f907c22b24';
  var FIRST_STUDENT_ADDR = '0x51adcda2c9b234853498efd83903cf250175ca40';
  var SECOND_STUDENT_ADDR = '0x9ec6e19e025e4bc7225758032585fb26ebf8de79';

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
    var userType = parseInt(instructor[5]);

    expect(accountId).toEqual(FIRST_INSTRUCTOR_ADDR);
    expect(email).toEqual('instructor1@qub.ac.uk');
    expect(name).toEqual('Kim Bauters');
    expect(attendanceBalance).toEqual(0);
    expect(feedbackBalance).toEqual(0);
    expect(userType).toEqual(1); // 0=student, 1=instructor, 2=admin
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
    var userType = parseInt(student[5]);

    expect(accountId).toEqual(FIRST_STUDENT_ADDR);
    expect(email).toEqual('student1@qub.ac.uk');
    expect(name).toEqual('Linzi Roberts');
    expect(attendanceBalance).toEqual(0);
    expect(feedbackBalance).toEqual(0);
    expect(userType).toEqual(0); // 0=student, 1=instructor, 2=admin
  });

  it("should be able to access studentAddresses mapping", function() {
    var studentAddr1 = theContract.studentsAddresses(1);
    console.log('Object of registered address = ' + studentAddr1);
    var student = theContract.users(studentAddr1);
    expect(parseInt(student[5])).toEqual(0);
  });

  it("should be able to access student details via their emailAddress", function() {
    var studentAddr1 = theContract.registeredEmails('student1@qub.ac.uk');
    console.log('registered address for student1 = ' + studentAddr1);
    var student = theContract.users(studentAddr1);
    expect(student[0].toString()).toEqual(studentAddr1);
    expect(student[0].toString()).toEqual(FIRST_STUDENT_ADDR);
    expect(parseInt(student[5])).toEqual(0);
  });

  it("should be able to create New user as student", function() {
    var newStudentAddr = gethWrapper.getEthAccount(0);
    console.log('==> newStudentAddr = ' + newStudentAddr);
    var txnHash = theContract.createUser(newStudentAddr, 'email@test.com', 'Student Test1', 0, {from: newStudentAddr});
    console.log('Transaction hash for Student creation = ' + txnHash);

    expect(txnHash).toBeDefined();

    var student = theContract.users(newStudentAddr);
    expect(student).toBeDefined();
    expect(student[0].toString()).toEqual(newStudentAddr);
    expect(gethWrapper.bytesToString(student[1])).toEqual('email@test.com');
    expect(gethWrapper.bytesToString(student[2])).toEqual('Student Test1');
    expect(parseInt(student[3])).toEqual(0);
    expect(parseInt(student[4])).toEqual(0);
    expect(parseInt(student[5])).toEqual(0); // 0=student, 1=instructor, 2=admin
    expect(parseInt(student[6])).toEqual(0); // numOfClasses
    expect(parseInt(student[7])).toEqual(0); // numOfTransfers
    expect(parseInt(student[8])).toEqual(0); // numOfAttendances
  });

  it("should be able to create New user as instructor", function() {
    var newInstructorAddr = gethWrapper.getEthAccount(1);
    var txnHash = theContract.createUser(newInstructorAddr, 'email2@test.com', 'Instructor Test1', 1, {from: newInstructorAddr});
    console.log('Transaction hash for instructor creation = ' + txnHash);

    expect(txnHash).toBeDefined();

    var instructor = theContract.users(newInstructorAddr);
    expect(instructor).toBeDefined();
    expect(instructor[0].toString()).toEqual(newInstructorAddr);
    expect(gethWrapper.bytesToString(instructor[1])).toEqual('email2@test.com');
    expect(gethWrapper.bytesToString(instructor[2])).toEqual('Instructor Test1');
    expect(parseInt(instructor[3])).toEqual(0);
    expect(parseInt(instructor[4])).toEqual(0);
    expect(parseInt(instructor[5])).toEqual(1); // 0=student, 1=instructor, 2=admin
    expect(parseInt(instructor[7])).toEqual(0); // numOfClasses
  });

  it("should be able to create New class for given instructor and retrieve it", function() {
    var newInstructorAddr = gethWrapper.getEthAccount(2);
    var txnHash1 = theContract.createUser(newInstructorAddr, 'email3@test.com', 'Instructor Test2', 1, {from: newInstructorAddr, gas: 3000000});
    console.log('Transaction hash for user creation = ' + txnHash1);
    var txnHash2 = theContract.createClass(newInstructorAddr, "Networks", "Room 1", "09:00", 1, "20/09/2016", 1, {from: newInstructorAddr, gas: 3000000});
    console.log('Transaction hash for class creation = ' + txnHash2);

    expect(txnHash1).toBeDefined();
    expect(txnHash2).toBeDefined();

    var instructor = theContract.users(newInstructorAddr);
    expect(instructor).toBeDefined();
    expect(parseInt(instructor[6])).toEqual(1); // numOfClasses to be set to 1

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
      expect(parseInt(data[6])).toEqual(1);  // "lecture" is 1 and "practical" is 0
      expect(data[7].toString()).toEqual(theContract.classesAddresses(1)); // Check that the address of the Class matches the address within the dedicated Mapping for classes addresses
      expect(parseInt(data[8])).toEqual(20);  // reward is (classType+1)*10*duration (20 for 1h lecture, 40 for 2h lecture, 10 for 1h Practical, etc.)
      expect(parseInt(data[9])).toEqual(0); // numOfStudents
    });
  });

  it("should be able to enroll a list of students to an existing class", function() {
    // CREATE NEW INSTRUCTOR
    var newInstructorAddr = gethWrapper.getEthAccount(3);
    var txnHash1 = theContract.createUser(newInstructorAddr, 'email4@test.com', 'Instructor Test3', 1, {from: newInstructorAddr, gas: 3000000});
    console.log('Transaction hash for instructor creation = ' + txnHash1);

    // CREATE NEW STUDENT 1
    var st1 = gethWrapper.getEthAccount(4);
    var tx1 = theContract.createUser(st1, 'email1@test.com', 'Student Test11', 0, {from: st1, gas: 3000000});
    console.log('Transaction hash for student1 creation = ' + tx1);
    var st1Returned = theContract.users(st1);
    console.log('st1Returned = ' + st1Returned);
    //VALIDATE STUDENT 1
    expect(st1Returned).toBeDefined();
    expect(st1Returned[0].toString()).toEqual(st1);
    expect(gethWrapper.bytesToString(st1Returned[1])).toEqual('email1@test.com');
    expect(gethWrapper.bytesToString(st1Returned[2])).toEqual('Student Test11');
    expect(parseInt(st1Returned[5])).toEqual(0); // 0=student, 1=instructor, 2=admin
    expect(parseInt(st1Returned[6])).toEqual(0); // numOfClasses

    // CREATE NEW STUDENT 2
    var st2 = gethWrapper.getEthAccount(5);
    var tx2 = theContract.createUser(st2, 'email2@test.com', 'Student Test12', 0, {from: st2, gas: 3000000});
    console.log('Transaction hash for student2 creation = %s', tx2);

    // CREATE NEW CLASS
    var numOfClassesBefore = parseInt(theContract.numOfClasses());
    var txnHash2 = theContract.createClass(newInstructorAddr, "Networks", "Room 1", "11:00", 2, "20/09/2016", 1, {from: newInstructorAddr, gas: 3000000});
    console.log('Transaction hash for class creation = ' + txnHash2);

    // VALIDATE numOfClasses incremented
    var numOfClassesAfter = parseInt(theContract.numOfClasses());
    expect(numOfClassesAfter).toEqual(numOfClassesBefore + 1);
    var classToCheck = theContract.getClassAtIndex(newInstructorAddr, 1);
    expect(classToCheck).toBeDefined();
    var createdClassAddress = classToCheck[7].toString();

    // ENROLL 2 students to class:
    var txnHash3 = theContract.enrollStudentsToClass([st1, st2], createdClassAddress, {from: newInstructorAddr, gas: 3000000});

    // CHECK both STUDENTS numOfClasses are all set to 1
    var student1 = theContract.users(st1);
    expect(student1[0].toString()).toEqual(st1);
    expect(parseInt(student1[6])).toEqual(1); // check that numOfClasses is 1
    var student2 = theContract.users(st2);
    expect(student2[0].toString()).toEqual(st2);
    expect(parseInt(student2[6])).toEqual(1); // check that numOfClasses is 1

    // CHECK THAT CLASS's numOfStudents is set to 2
    classToCheck = theContract.getClassAtAddress(createdClassAddress);
    expect(classToCheck).toBeDefined();
    console.log("=============> class is = %s", classToCheck);
    expect(parseInt(classToCheck[9])).toEqual(2); // numOfStudents
  });

  it("should be able to logAttendance for a class that I am enrolled into", function() {
    // CREATE NEW INSTRUCTOR
    var newInstructorAddr = gethWrapper.getEthAccount(6);
    var txnHash1 = theContract.createUser(newInstructorAddr, 'email5@test.com', 'Instructor Test5', 1, {from: gethWrapper.getEthAccount(0), gas: 3000000});
    console.log('Transaction hash for instructor creation = ' + txnHash1);
    var instrReturned = theContract.users(newInstructorAddr);
    console.log('instrReturned = ' + instrReturned);

    // CREATE NEW STUDENT 1
    var st1 = gethWrapper.getEthAccount(7);
    var tx1 = theContract.createUser(st1, 'email7@test.com', 'Student Test17', 0, {from: gethWrapper.getEthAccount(0), gas: 3000000});
    console.log('Transaction hash for user creation = ' + tx1);
    var st1Returned = theContract.users(st1);
    console.log('st1Returned = ' + st1Returned);
    // CREATE NEW CLASS
    var txnHash2 = theContract.createClass(newInstructorAddr, "Networks", "Room 1", "11:00", 2, "20/09/2016", 1, {from: newInstructorAddr, gas: 3000000});
    console.log('Transaction hash for class creation = ' + txnHash2);
    // VALIDATE numOfClasses incremented
    var numOfClassesAfter = parseInt(theContract.numOfClasses());
    console.log('numOfClassesAfter = ' + numOfClassesAfter);
    var classToCheck = theContract.getClassAtIndex(newInstructorAddr, 1);
    expect(classToCheck).toBeDefined();
    var createdClassAddress = classToCheck[7].toString();
    console.log('classToCheck= %s, createdClassAddress = %s', classToCheck, createdClassAddress);

    // ENROLL student to class:
    var txnHash3 = theContract.enrollStudentsToClass([st1], createdClassAddress, {from: newInstructorAddr, gas: 3000000});
    console.log('Transaction hash for class enrollment = ' + txnHash3);
    var txnHash4 = theContract.logAttendance(createdClassAddress, 'qubsecret', {from: st1, gas: 3000000});

    var student1 = theContract.users(st1);
    expect(student1[0].toString()).toEqual(st1);
    expect(parseInt(student1[3])).toEqual(40); // attendanceBalance
    expect(parseInt(student1[4])).toEqual(10); // feedbackBalance
    expect(parseInt(student1[7])).toEqual(2); // numOfTransfers

    var tfr1 = theContract.getTransferAtIndex(1, {from: st1, gas: 3000000});
    expect(tfr1).toBeDefined();
    expect(tfr1[0]).toEqual(false);  //isDebit = false
    expect(tfr1[1].toString()).toEqual(createdClassAddress); // sender = classId
    expect(tfr1[2].toString()).toEqual(st1); // receiver = student address
    expect(tfr1[3].toString()).toEqual(createdClassAddress); // classId = classId
    expect(parseInt(tfr1[4])).toEqual(0); // attendance
    expect(parseInt(tfr1[5])).toEqual(40); // amount
    expect(parseInt(tfr1[6])).toEqual(4); // 4 = NA

    var tfr2 = theContract.getTransferAtIndex(2);
    expect(tfr2).toBeDefined();
    expect(tfr2[0]).toEqual(false);  //isDebit = false
    expect(tfr2[1].toString()).toEqual(createdClassAddress); // sender = classId
    expect(tfr2[2].toString()).toEqual(st1); // receiver = student address
    expect(tfr2[3].toString()).toEqual(createdClassAddress); // classId = classId
    expect(parseInt(tfr2[4])).toEqual(1); // feedback
    expect(parseInt(tfr2[5])).toEqual(10); // amount
    expect(parseInt(tfr2[6])).toEqual(4); // 4 = NA
  });
});
