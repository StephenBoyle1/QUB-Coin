contract QUBCoin {

  address constant addr1 = 0xb99ad90226f8e53f998334171f007a0191e07b7d;
  address constant addr2 = 0x54fe03c5df044aadbb7b1d17198916f907c22b24;
  address constant addr3 = 0xd618d80432d9f3c3805409e20cd4e66714a6a1e7;
  address constant addr4 = 0x51adcda2c9b234853498efd83903cf250175ca40;
  address constant addr5 = 0x9ec6e19e025e4bc7225758032585fb26ebf8de79;

  struct Instructor{
    address accountId;
    string email;
    string name;
    uint coinBalance;
  }

  struct Student{
    address accountId;
    string email;
    string name;
    uint attendanceBalance;
    uint coinBalance;
  }

  // Stores the instructor details in a static array (only coinBalance will evolve)
  mapping(address => Instructor) public instructors;
  address private creator;
  uint public numInstructors;

  modifier creatorOnly(){
      if (msg.sender == creator) _
  }

  //Constructor - only run once on creation
  function QubCoin(){
      creator = msg.sender;
      instructors[addr1] = Instructor(addr1, "instructor1@qub.ac.uk", "Instructor One", 0);
      instructors[addr2] = Instructor(addr2, "instructor2@qub.ac.uk", "Instructor Two", 0);
      instructors[addr3] = Instructor(addr3, "instructor3@qub.ac.uk", "Instructor Three", 0);
      instructors[addr4] = Instructor(addr4, "instructor4@qub.ac.uk", "Instructor Four", 0);
      instructors[addr5] = Instructor(addr5, "instructor5@qub.ac.uk", "Instructor Five", 0);
      numInstructors = 5;
  }
}
