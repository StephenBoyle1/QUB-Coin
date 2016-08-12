contract QUBClass {
  address public instructor;
  bytes32 public name;
  bytes32 public location;
  bytes32 public startTime;
  uint8 public duration;
  bytes32 public date;
  bytes32 public classType;
  address[] students;

  function QUBClass(
    address _instructor,
    bytes32 _name,
    bytes32 _location,
    bytes32 _startTime,
    uint8 _duration,
    bytes32 _date,
    bytes32 _classType) {
      instructor = _instructor;
      name = _name;
      location = _location;
      startTime = _startTime;
      duration = _duration;
      date = _date;
      classType = _classType;
  }

  function enrollStudent(address studentId){
      students.push(studentId);
  }
}

contract QUBCoin {

  address constant addr1 = 0xb99ad90226f8e53f998334171f007a0191e07b7d;
  address constant addr2 = 0x54fe03c5df044aadbb7b1d17198916f907c22b24;
  address constant addr3 = 0xd618d80432d9f3c3805409e20cd4e66714a6a1e7;
  address constant addr4 = 0x51adcda2c9b234853498efd83903cf250175ca40;
  address constant addr5 = 0x9ec6e19e025e4bc7225758032585fb26ebf8de79;

  struct User{
    address accountId;
    bytes32 email;
    bytes32 name;
    uint attendanceBalance;
    uint feedbackBalance;
    bool isStudent;
    bool isAdmin;
    uint numOfClasses;
    mapping(uint => QUBClass) classes;
  }

  // Stores the instructor and students details in a static array (only Balances will evolve)
  mapping(address => User) public users;

  // Cant use string for key of a mapping: need to use a fied-length type like bytes32
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
      users[addr1] = User(addr1, "admin@qub.ac.uk", "Administrator", 0, 0, false, true, 0);
      users[addr2] = User(addr2, "instructor1@qub.ac.uk", "Kim Bauters", 0, 0, false, false, 0);
      users[addr3] = User(addr3, "instructor2@qub.ac.uk", "Aidan McGowan", 0, 0, false, false, 0);
      numOfInstructors = 2;

      users[addr4] = User(addr4, "student1@qub.ac.uk", "Linzi Roberts", 0, 0, true, false, 0);
      users[addr5] = User(addr5, "student2@qub.ac.uk", "Stephen Boyle", 0, 0, true, false, 0);
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

  function createUser(address accountId, bytes32 email, bytes32 name, bool isStudent) {
      // Check that user address and email passed are NOT already registered
      if(users[accountId].accountId == accountId || registeredEmails[email] != address(0x0)){
          throw;
      }

      users[accountId] = User(accountId, email, name, 0, 0, isStudent, false, 0);
      registeredEmails[email] = accountId;

      if(isStudent){
        numOfStudents++;
        studentsAddresses[numOfStudents] = accountId;
      } else{
        numOfInstructors++;
        instructorsAddresses[numOfInstructors] = accountId;
      }
  }

  function createClass(address _instructor, bytes32 _name, bytes32 _location, bytes32 _startTime, uint8 _duration, bytes32 _date, bytes32 _classType){
        // Check that instructor address passed is existing
        if(users[_instructor].accountId == address(0x0)){
            throw;
        }
        QUBClass newClass = new QUBClass(_instructor, _name, _location, _startTime, _duration, _date, _classType);
        users[_instructor].numOfClasses++;
        users[_instructor].classes[users[_instructor].numOfClasses] = newClass;
        classesAddresses[++numOfClasses] = address(newClass);
        classes[address(newClass)] = newClass;
  }

  function enrollStudentToClass(address _studentId, address _classId){
        // Check that both student and class exist
        if(users[_studentId].accountId == address(0x0) || classes[_classId].instructor() == address(0x0)){
            throw;
        }
        users[_studentId].numOfClasses++;
        users[_studentId].classes[users[_studentId].numOfClasses] = classes[_classId];
  }

  function getClassAtIndex(address _accountId, uint _index) constant returns (address instructor, bytes32 name, bytes32 location, bytes32 startTime, uint8 duration, bytes32 date, bytes32 theClassType, address classAddress){
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
    theClassType = myClass.classType();
    classAddress = address(myClass);
  }

  function getClassAtAddress(address _classId) constant returns (address instructor, bytes32 name, bytes32 location, bytes32 startTime, uint8 duration, bytes32 date, bytes32 theClassType, address classAddress){
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
    theClassType = myClass.classType();
    classAddress = _classId;
  }
}