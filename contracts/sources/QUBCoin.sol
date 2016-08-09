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
  }

  // Stores the instructor and students details in a static array (only Balances will evolve)
  mapping(address => User) public users;

  // Cant use string for key of a mapping: need to use a fied-length type like bytes32
  mapping(bytes32 => address) public registeredEmails;

  mapping(uint => address) public instructorsAddresses;
  mapping(uint => address) public studentsAddresses;

  address private creator;
  uint public numOfInstructors;
  uint public numOfStudents;

  modifier creatorOnly(){
      if (msg.sender == creator) _
  }

  //Constructor - only run once on creation
  function QUBCoin(){
      creator = msg.sender;
      users[addr1] = User(addr1, "instructor1@qub.ac.uk", "Kim Bauters", 0, 0, false);
      users[addr2] = User(addr2, "instructor2@qub.ac.uk", "Aidan McGowan", 0, 0, false);
      numOfInstructors = 2;

      users[addr3] = User(addr3, "student1@qub.ac.uk", "Linzi Roberts", 0, 0, true);
      users[addr4] = User(addr4, "student2@qub.ac.uk", "Stephen Boyle", 0, 0, true);
      users[addr5] = User(addr5, "student3@qub.ac.uk", "Mike ONeill", 0, 0, true);
      numOfStudents = 3;

      registeredEmails["instructor1@qub.ac.uk"] = addr1;
      registeredEmails["instructor2@qub.ac.uk"] = addr2;
      registeredEmails["student1@qub.ac.uk"] = addr3;
      registeredEmails["student2@qub.ac.uk"] = addr4;
      registeredEmails["student3@qub.ac.uk"] = addr5;

      instructorsAddresses[0] = addr1;
      instructorsAddresses[1] = addr2;
      studentsAddresses[0] = addr3;
      studentsAddresses[1] = addr4;
      studentsAddresses[2] = addr5;
  }
}