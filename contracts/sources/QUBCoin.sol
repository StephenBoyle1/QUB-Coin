contract QUBClass {

  enum ClassType { Practical, Lecture }

  address public instructor;
  bytes32 public name;
  bytes32 public location;
  bytes32 public startTime;
  uint8 public duration;
  bytes32 public date;
  ClassType private classType;
  bytes32 private secret;
  uint public attendanceReward;
  address[] public students;

  function QUBClass(
    address _instructor,
    bytes32 _name,
    bytes32 _location,
    bytes32 _startTime,
    uint8 _duration,
    bytes32 _date,
    uint8 _classType) {
      instructor = _instructor;
      name = _name;
      location = _location;
      startTime = _startTime;
      duration = _duration;
      date = _date;
      classType = ClassType(_classType);
      attendanceReward = (_classType + 1) * duration * 10;
      secret = 'qubsecret';
  }

  function enrollStudent(address studentId){
    students.push(studentId);
  }

  function getStudentsCount() returns (uint count){
    return students.length;
  }

  function getType() returns (uint8 count){
    return uint8(classType);
  }

  function isStudentEnrolled(address studentId) returns (bool present){
    for(uint i=0; i<students.length; i++){
      if(students[i] == studentId) return true;
    }
    return false;
  }

  function setSecret(bytes32 _secret){
    if(instructor == tx.origin){
      secret = _secret;
    }
  }

  function matchesSecret(bytes32 _secretCheck) returns (bool itMatches){
    return (_secretCheck == secret);
  }
}

contract QUBCoin {

   uint16 constant ERROR_ACCOUNT_NOT_REGISTERED = 1000;
   uint16 constant ERROR_UNKNOWN_CLASS = 1001;
   uint16 constant ERROR_STUDENT_NOT_ENROLLED = 1002;
   uint16 constant ERROR_STUDENT_DID_NOT_ATTEND = 1003;
   uint16 constant ERROR_INSUFFICIENT_FEEDBACK_BALANCE = 1004;
   uint16 constant ERROR_STUDENT_ALREADY_ATTENDED = 1005;
   uint16 constant ERROR_CLASS_SECRET_MISMATCH = 1006;

  address constant addr1 = 0xb99ad90226f8e53f998334171f007a0191e07b7d;
  address constant addr2 = 0x54fe03c5df044aadbb7b1d17198916f907c22b24;
  address constant addr3 = 0xd618d80432d9f3c3805409e20cd4e66714a6a1e7;
  address constant addr4 = 0x51adcda2c9b234853498efd83903cf250175ca40;
  address constant addr5 = 0x9ec6e19e025e4bc7225758032585fb26ebf8de79;

  enum CoinType { Attendance, Feedback }
  enum UserType { Student, Instructor, Admin }
  enum FeedbackRate { Excellent, Good, Average, Poor, NA }

  event FeedbackSentEvent(uint16 indexed error, address indexed senderId, address indexed classId);
  event AttendanceLoggedEvent(uint16 indexed error, address indexed senderId, address indexed classId);

  struct CoinTransfer {
    address sender;
    address receiver;
    address qubClass;
    CoinType coinType;
    uint amount;
    uint8 feedbackRate;
    uint timeStamp;
  }

  struct Attendance {
    address classId;
    uint attendanceAmount;
    uint feedbackAmount;
  }

  struct User {
    address accountId;
    bytes32 email;
    bytes32 name;
    uint attendanceBalance;
    uint feedbackBalance;
    UserType userType;
    uint numOfClasses;
    uint numOfTransfers;
    mapping(uint => QUBClass) classes;
    mapping(uint => CoinTransfer) transfers;
    // address is the QUBClass address for which that user is attending
    mapping(address => Attendance) attendances;
  }

  // Stores the instructor and students details in a static array (only Balances will evolve)
  mapping(address => User) public users;

  // Cant use string for key of a mapping: need to use a fixed-length type like bytes32
  mapping(bytes32 => address) public registeredEmails;

  mapping(uint => address) public instructorsAddresses;
  mapping(uint => address) public studentsAddresses;

  mapping(address => QUBClass) public classes;
  mapping(uint => address) public classesAddresses;

  address public creator;
  uint public numOfInstructors;
  uint public numOfStudents;
  uint public numOfClasses;

  modifier creatorOnly(){
    if (msg.sender == creator) _
  }

  //Constructor - only run once on creation
  function QUBCoin(){
    creator = msg.sender;
    users[addr1] = User(addr1, "admin@qub.ac.uk", "Administrator", 0, 0, UserType.Admin, 0, 0);
    users[addr2] = User(addr2, "instructor1@qub.ac.uk", "Kim Bauters", 0, 0, UserType.Instructor, 0, 0);
    users[addr3] = User(addr3, "instructor2@qub.ac.uk", "Aidan McGowan", 0, 0, UserType.Instructor, 0, 0);
    numOfInstructors = 2;

    users[addr4] = User(addr4, "student1@qub.ac.uk", "Linzi Roberts", 0, 0, UserType.Student, 0, 0);
    users[addr5] = User(addr5, "student2@qub.ac.uk", "Stephen Boyle", 0, 0, UserType.Student, 0, 0);
    numOfStudents = 2;

    registeredEmails["admin@qub.ac.uk"] = addr1;
    registeredEmails["instructor1@qub.ac.uk"] = addr2;
    registeredEmails["instructor2@qub.ac.uk"] = addr3;
    registeredEmails["student1@qub.ac.uk"] = addr4;
    registeredEmails["student2@qub.ac.uk"] = addr5;

    instructorsAddresses[1] = addr2;
    instructorsAddresses[2] = addr3;
    studentsAddresses[1] = addr4;
    studentsAddresses[2] = addr5;
    numOfClasses = 0;
  }

  function enrollStudentToClass(address _studentId, address _classId) internal {
    // Check that both student and class exist
    if(users[_studentId].accountId == address(0x0) || classes[_classId].instructor() == address(0x0)){
      throw;
    }

    classes[_classId].enrollStudent(_studentId);
    users[_studentId].classes[++users[_studentId].numOfClasses] = classes[_classId];
  }

  function enrollStudentsToClass(address[] _studentIds, address _classId) external {
    for (uint i = 0; i < _studentIds.length; i++){
      enrollStudentToClass(_studentIds[i], _classId);
    }
  }

  function logAttendance(address _classId, bytes32 _secret) external returns (uint16 error) {
    // Check that both student and class exist
    User theStudent = users[msg.sender];
    if(theStudent.accountId == address(0x0)){
      AttendanceLoggedEvent(ERROR_ACCOUNT_NOT_REGISTERED, msg.sender, _classId);
      return ERROR_ACCOUNT_NOT_REGISTERED;
    }
    if(classes[_classId].instructor() == address(0x0)){
      AttendanceLoggedEvent(ERROR_UNKNOWN_CLASS, msg.sender, _classId);
      return ERROR_UNKNOWN_CLASS;
    }

    // Check that the student is enrolled
    if(!classes[_classId].isStudentEnrolled(msg.sender)){
      AttendanceLoggedEvent(ERROR_STUDENT_NOT_ENROLLED, msg.sender, _classId);
      return ERROR_STUDENT_NOT_ENROLLED;
    }

    // Check that the attendance was not already logged for that class
    if(theStudent.attendances[_classId].classId != address(0x0)){
      AttendanceLoggedEvent(ERROR_STUDENT_ALREADY_ATTENDED, msg.sender, _classId);
      return ERROR_STUDENT_ALREADY_ATTENDED;
    }

    // Check that the secret matches the class's secret
    if(!classes[_classId].matchesSecret(_secret)){
      AttendanceLoggedEvent(ERROR_CLASS_SECRET_MISMATCH, msg.sender, _classId);
      return ERROR_CLASS_SECRET_MISMATCH;
    }

    theStudent.attendances[_classId] = Attendance(_classId, classes[_classId].attendanceReward(), 10);
    CoinTransfer memory attendanceTransfer = CoinTransfer(_classId, msg.sender, _classId, CoinType.Attendance, classes[_classId].attendanceReward(), uint8(FeedbackRate.NA), now);
    CoinTransfer memory feedbackTransfer = CoinTransfer(_classId, msg.sender, _classId, CoinType.Feedback, 10, uint8(FeedbackRate.NA), now);
    theStudent.transfers[++theStudent.numOfTransfers] = attendanceTransfer;
    theStudent.transfers[++theStudent.numOfTransfers] = feedbackTransfer;
    theStudent.attendanceBalance += classes[_classId].attendanceReward();
    theStudent.feedbackBalance += 10;
    AttendanceLoggedEvent(0, msg.sender, _classId);
  }

  function sendFeedback(address _classId, uint _feedbackPoints, uint8 _feedbackRate) external returns (uint16 error) {
    // Check that both student and class exist
    User theStudent = users[msg.sender];
    if(theStudent.accountId == address(0x0)){
      FeedbackSentEvent(ERROR_ACCOUNT_NOT_REGISTERED, msg.sender, _classId);
      return ERROR_ACCOUNT_NOT_REGISTERED;
    }
    if(classes[_classId].instructor() == address(0x0)){
      FeedbackSentEvent(ERROR_UNKNOWN_CLASS, msg.sender, _classId);
      return ERROR_UNKNOWN_CLASS;
    }

    // Check that the student is enrolled
    if(!classes[_classId].isStudentEnrolled(msg.sender)){
      FeedbackSentEvent(ERROR_STUDENT_NOT_ENROLLED, msg.sender, _classId);
      return ERROR_STUDENT_NOT_ENROLLED;
    }

    // Check that the attendance was logged for that class
    if(theStudent.attendances[_classId].classId == address(0x0)){
      FeedbackSentEvent(ERROR_STUDENT_DID_NOT_ATTEND, msg.sender, _classId);
      return ERROR_STUDENT_DID_NOT_ATTEND;
    }

    //Check that student has enough feedback coins to send to receiver
    if(theStudent.attendances[_classId].feedbackAmount < _feedbackPoints){
      FeedbackSentEvent(ERROR_INSUFFICIENT_FEEDBACK_BALANCE, msg.sender, _classId);
      return ERROR_INSUFFICIENT_FEEDBACK_BALANCE;
    }

    CoinTransfer memory theTransfer = CoinTransfer(msg.sender, classes[_classId].instructor(), _classId, CoinType.Feedback, _feedbackPoints, _feedbackRate, now);
    theStudent.transfers[++theStudent.numOfTransfers] = theTransfer;
    theStudent.attendances[_classId].feedbackAmount -= _feedbackPoints;
    theStudent.feedbackBalance -= _feedbackPoints;

    User theRecipient = users[classes[_classId].instructor()];
    theRecipient.transfers[++theRecipient.numOfTransfers] = theTransfer;
    theRecipient.feedbackBalance += _feedbackPoints;
    FeedbackSentEvent(0, msg.sender, _classId);
  }

  function setClassSecret(address _classId, bytes32 secret) external {
    classes[_classId].setSecret(secret);
  }

  function createUser(address accountId, bytes32 email, bytes32 name, UserType userType) external {
    // Check that user address and email passed are NOT already registered
    if(users[accountId].accountId == accountId || registeredEmails[email] != address(0x0)){
      throw;
    }

    users[accountId] = User(accountId, email, name, 0, 0, userType, 0, 0);
    registeredEmails[email] = accountId;

    if(userType == UserType.Student){
      studentsAddresses[++numOfStudents] = accountId;
    } else {
      instructorsAddresses[++numOfInstructors] = accountId;
    }
  }

  function createClass(address _instructor,
    bytes32 _name,
    bytes32 _location,
    bytes32 _startTime,
    uint8 _duration,
    bytes32 _date,
    uint8 _classType)
  external {
    // Check that instructor address passed is existing
    if(users[_instructor].accountId == address(0x0)){
      throw;
    }
    QUBClass newClass = new QUBClass(_instructor, _name, _location, _startTime, _duration, _date, _classType);
    users[_instructor].classes[++(users[_instructor].numOfClasses)] = newClass;
    classesAddresses[++numOfClasses] = address(newClass);
    classes[address(newClass)] = newClass;
  }

  function getClassAtIndex(address _accountId, uint _index)
  constant
  returns (address instructor, bytes32 name, bytes32 location, bytes32 startTime, uint8 duration,
           bytes32 date, uint8 theClassType, address classAddress, uint attendanceReward, uint numOfStudents){
    if(_index > users[_accountId].numOfClasses){
      throw;
    }
    QUBClass myClass = users[_accountId].classes[_index];

    instructor = myClass.instructor();
    name = myClass.name();
    location = myClass.location();
    startTime = myClass.startTime();
    duration = myClass.duration();
    date = myClass.date();
    theClassType = myClass.getType();
    classAddress = address(myClass);
    attendanceReward = myClass.attendanceReward();
    numOfStudents = myClass.getStudentsCount();
  }

  function getClassAtAddress(address _classId)
  constant
  returns (address instructor, bytes32 name, bytes32 location, bytes32 startTime, uint8 duration,
           bytes32 date, uint8 theClassType, address classAddress, uint attendanceReward, uint numOfStudents){
    if(classes[_classId].instructor() == address(0x0)){
      throw;
    }
    QUBClass myClass = classes[_classId];

    instructor = myClass.instructor();
    name = myClass.name();
    location = myClass.location();
    startTime = myClass.startTime();
    duration = myClass.duration();
    date = myClass.date();
    theClassType = myClass.getType();
    classAddress = _classId;
    attendanceReward = myClass.attendanceReward();
    numOfStudents = myClass.getStudentsCount();
  }

  function getTransferAtIndex(uint _index)
  constant
  returns (bool isDebit, address sender, address receiver, address qubClass, uint8 coinType, uint amount, uint8 feedbackRate, uint timeStamp){
    User theUser = users[msg.sender];
    CoinTransfer theTransfer = theUser.transfers[_index];
    if(theTransfer.sender == address(0x0)){
      throw;
    }
    isDebit = (theUser.accountId == theTransfer.sender);
    sender = theTransfer.sender;
    receiver = theTransfer.receiver;
    qubClass = theTransfer.qubClass;
    coinType = uint8(theTransfer.coinType);
    amount = theTransfer.amount;
    feedbackRate = uint8(theTransfer.feedbackRate);
    timeStamp = theTransfer.timeStamp;
  }
}
