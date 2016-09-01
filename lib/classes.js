var ethAuth = require('../lib/auth.js');

module.exports = {
    createNewClass: createNewClass,
    getClassesFor: getClassesFor,
    getAllClasses: getAllClasses,
    getClassForAddress: getClassForAddress,
    sendCoins: sendCoins,
    enrollStudentsToClass: enrollStudentsToClass,
    logAttendanceFor: logAttendanceFor,
    getTransfersFor: getTransfersFor
};

/**
 * Creates a new instance of a class within the QUBCoin smart contract
 *
 * @param fromUser    The authenticated user address wanting to create a class
 * @param name        Name of the class
 * @param location    Room location
 * @param startTime   Starting time of the class
 * @param duration    Duration in hours of the class (1, 2, or 3)
 * @param date        The date of the class
 * @param instructor  The name of the instructor
 * @param type        The type of class to be created: either "Lecture" or "Practical"
 * @param callback    Since this is a transaction, it will be only confirmed asynchronously,
 *                    this callback will be used so that the caller will wait until transaction is confirmed
 *
 * @returns Nothing: just use the callback method passed ot this function
 * }
 */
function createNewClass(fromUser, name, location, startTime, duration, date, instructor, type, callback) {
    qubCoinContract().createClass(instructor, name, location, startTime, duration, date, type,
        {from: fromUser, gas: 3000000}, function(error, data){
            if(error){
                console.log("Problem creating class: " + error);
                callback(error, null);
            } else {
                console.log("Created class successfully via txn [%s]", data);
                waitForTxnConfirmed(data, callback)
            }
        }
    );
}

/**
 * This method actually calls the ethereum-hosted smart contract and invokes the exposed "getClassAtIndex" and the user's numOfClasses()
 *
 *  !!! NOTE THAT THE CLASSES Mapping is 1-based array as opposed to 0-based array !!!
 *
 * @param authenticatedUser The user for which we want to retrieve the classes
 *
 * @returns an array of classes objects:
 * {
 *  "classId": "0xfdccaa886d3dfdf1a157ad605ea4185d2f420a52",
 *  "name": "Networks",
 *  "location": "Room 1",
 *  "startTime": "09:00",
 *  "duration": 1,
 *  "date": "14/08/2016",
 *  "instructor": {
 *      "id": "0xfdccaa886d3dfdf1a157ad605ea4185d2f420a52",
 *      "email": "instructor1@qub.ac.uk",
 *      "name": "Dummy Instructor"
 *  },
 *  "classType": "lecture",
 *  "attendanceReward": 10,
 *  "numOfStudents": 23
 * }
 */
function getClassesFor(authenticatedUser){
    var classesList = [];

    console.log("retrieving classes for user [%s], count=[%s]", authenticatedUser.accountId, authenticatedUser.numOfClasses);

    for(var index=1; index <= authenticatedUser.numOfClasses; index++){   // Starting INDEX at 1 here!!!
        classesList.push(
            convertRawClassDataToJson(qubCoinContract().getClassAtIndex(authenticatedUser.accountId, index))
        )
    }

    console.log("Retrieved list of classes:" + classesList);
    return classesList;
}

/**
 *
 * @param classAddress  The eth address of the class object to be retrieved
 *
 * @returns a single QUBClass object:
 * {
 *  "classId": "0xfdccaa886d3dfdf1a157ad605ea4185d2f420a52",
 *  "name": "Networks",
 *  "location": "Room 1",
 *  "startTime": "09:00",
 *  "duration": 1,
 *  "date": "14/08/2016",
 *  "instructor": {
 *      "id": "0xfdccaa886d3dfdf1a157ad605ea4185d2f420a52",
 *      "email": "instructor1@qub.ac.uk",
 *      "name": "Dummy Instructor"
 *  },
 *  "classType": "lecture",
 *  "attendanceReward": 10,
 *  "numOfStudents": 23
 * }
 */
function getClassForAddress(classAddress){

    console.log("retrieving class at address: [%s]", classAddress);

    var classToReturn = convertRawClassDataToJson(qubCoinContract().getClassAtAddress(classAddress));

    console.log("Retrieved class: [%j]", classToReturn);

    return classToReturn;
}


/**
 * This method actually calls the ethereum-hosted smart contract and invokes the exposed classes() and numOfClasses() functions
 * at the contract level (not the user level)
 *
 *  !!! NOTE THAT THE CLASSES Mapping is 1-based array as opposed to 0-based array !!!
 *
 * @returns an array of classes objects:
 * {
 *  "classId": "0xfdccaa886d3dfdf1a157ad605ea4185d2f420a52",
 *  "name": "Networks",
 *  "location": "Room 1",
 *  "startTime": "09:00",
 *  "duration": 1,
 *  "date": "14/08/2016",
 *  "instructor": {
 *      "id": "0xfdccaa886d3dfdf1a157ad605ea4185d2f420a52",
 *      "email": "instructor1@qub.ac.uk",
 *      "name": "Dummy Instructor"
 *  },
 *  "classType": "lecture",
 *  "attendanceReward": 10,
 *  "numOfStudents": 23
 * }
 */
function getAllClasses(){
    var numOfClasses = qubCoinContract().numOfClasses();
    var classesList = [];
    var thisClassAddress;

    console.log("retrieving all classes, count=[%s]", numOfClasses);
    for(var index=1; index <= numOfClasses; index++){   // Starting INDEX at 1 here!!!
        thisClassAddress = qubCoinContract().classesAddresses(index);
        classesList.push(convertRawClassDataToJson(qubCoinContract().getClassAtAddress(thisClassAddress)));
    }

    console.log("Retrieved list of classes: [%s]", classesList);
    return classesList;
}

/**
 * Enroll an existing student to an existing class (action available to administrator only)
 *
 * @param fromUser      The authenticated user address wanting to create a class
 * @param studentList   Array of student addresses to be enrolled to a class (ex: [studentEthAddress1, studentEthAddress2])
 * @param classAddress  Address of the class to enroll the students into
 * @param callback      Since this is a transaction, it will be only confirmed asynchronously,
 *                      this callback will be used so that the caller will wait until transaction is confirmed
 *
 * @returns Boolean: true if all went well, false else
 */
function enrollStudentsToClass(fromUser, studentList, classAddress, callback) {
    qubCoinContract().enrollStudentsToClass(studentList, classAddress,
        {from: fromUser, gas: 4000000}, function(error, data){
            if(error){
                console.log("Problem enrolling students: " + error);
                callback(error, null);
            } else {
                console.log("Enrolled students successfully via txn [%s]", data);
                waitForTxnConfirmed(data, callback)
            }
        }
    );
}


/**
 * Send points from the "fromUser" accountId to the instructor of the classId provided: it allows for points and 
 * for a feedback comment to be passed through.
 *
 * @param fromUser       The authenticated user address wanting to create a class
 * @param classId        The class address to send points for
 * @param feedbackPoints Amount of points to be sent to the instructor of the class
 * @param feedbackRate   The rate of the feedback to provide to the instructor
 * @param callback       Since this is a transaction, it will be only confirmed asynchronously,
 *                       this callback will be used so that the caller will wait until transaction is confirmed
 *
 * @returns invokes the callback with the transaction hash
 */
function sendCoins(fromUser, classId, feedbackPoints, feedbackRate, callback) {
    qubCoinContract().sendFeedback(classId, feedbackPoints, feedbackRate,
        {from: fromUser, gas: 4000000}, function(error, data){
            if(error){
                console.log("Problem sending feedback: " + error);
                callback(error, null);
            } else {
                console.log("Feedback sent successfully via txn [%s]", data);
                waitForSendFeedbackEvent(fromUser, classId, feedbackPoints, callback);
            }
        }
    );
}

/**
 * Logs attendance of the calling student to the specified class with the provided secret
 *
 * @param fromUser  The student that wants to log attendance
 * @param secret    The secret provided by instructor for that class allowing student to log to that class
 * @param classId   The class Id to attend to
 * @param callback  Since this is a transaction, it will be only confirmed asynchronously,
 *                  this callback will be used so that the caller will wait until transaction is confirmed
 */
function logAttendanceFor(fromUser, secret, classId, callback) {
    console.log("calling logAttendanceFor with %s, %s, %s", fromUser, secret, classId);
    qubCoinContract().logAttendance(classId, secret,
        {from: fromUser, gas:4000000}, function(err, data) {
            if (err) {
                console.log("Problem logging attendance to class: " + err);
                callback(err, null);
            } else {
                console.log("Logged attendance successfully via txn [%s]", data);
                // waitForTxnConfirmed(data, callback)
                waitForAttendanceLoggedEvent(fromUser, classId, callback);
            }
    });
}


function waitForSendFeedbackEvent(senderId, classId, points, callback){
    var feedbackEvent = qubCoinContract().FeedbackSentEvent({senderId: senderId, classId: classId}, function(error,log){
        if (!error){
            console.log("==> FeedbackSentEvent.args.error: %s", log.args.error);
            if(log.args.error == 0){
                feedbackEvent.stopWatching();
                callback(null, points);
            } else{
                feedbackEvent.stopWatching();
                callback(log.args.error, null);
            }
        } else{
            console.log("==> FeedbackSentEvent ERROR: %s", error);
            feedbackEvent.stopWatching();
            callback(error, null);
        }
    });
}


function waitForAttendanceLoggedEvent(senderId, classId, callback){
    var attendanceLogEvent = qubCoinContract().AttendanceLoggedEvent({senderId: senderId, classId: classId}, function(error,log){
        if (!error){
            console.log("==> AttendanceLoggedEvent.args.error: %s", log.args.error);
            if(log.args.error == 0){
                attendanceLogEvent.stopWatching();
                callback(null, classId);
            } else{
                attendanceLogEvent.stopWatching();
                callback(log.args.error, null);
            }
        } else{
            console.log("==> AttendanceLoggedEvent ERROR: %s", error);
            attendanceLogEvent.stopWatching();
            callback(error, null);
        }
    });
}

/**
 * This method returns an array of transfer objects relevant to the authenticated user
 *
 *  !!! NOTE THAT THE CLASSES Mapping is 1-based array as opposed to 0-based array !!!
 *
 * @param authenticatedUser The user for which we want to retrieve the transfers
 *
 * @returns an array of transfers objects:
 * {
        isDebit: true,
        sender: "Student 1",
        receiver: "Instructor Name",
        coinType: "Attendance",
        amount: 8,
        feedbackRate: "Excellent",
        timestamp: 81273618273618723
    }
 */
function getTransfersFor(authenticatedUser){
    var transfersList = [];

    console.log("retrieving transfers for user [%s], count=[%s]", authenticatedUser.accountId, authenticatedUser.numOfTransfers);

    for(var index=1; index <= authenticatedUser.numOfTransfers; index++){   // Starting INDEX at 1 here!!!
        transfersList.push(
            convertRawTransferDataToJson(authenticatedUser, qubCoinContract().getTransferAtIndex(index))
        )
    }

    console.log("Retrieved list of transfers:", transfersList);
    return transfersList;
}


function convertRawClassDataToJson(rawClass){
    console.log("converting rawClass data: [%s]", rawClass);
    var classInstructorId = rawClass[0].toString();
    var classInstructor = qubCoinContract().users(classInstructorId);
    return {
        classId: rawClass[7].toString(),
        name: web3Wrapper().toUtf8(rawClass[1]),
        location: web3Wrapper().toUtf8(rawClass[2]),
        startTime: web3Wrapper().toUtf8(rawClass[3]),
        duration: parseInt(rawClass[4]),
        date: web3Wrapper().toUtf8(rawClass[5]),
        instructor: {
            id: classInstructorId,
            email: web3Wrapper().toUtf8(classInstructor[1]),
            name: web3Wrapper().toUtf8(classInstructor[2])
        },
        classType: parseToClassEnum(rawClass[6]),
        attendanceReward: parseInt(rawClass[8]),
        numOfStudents: parseInt(rawClass[9])
    }
}

function convertRawTransferDataToJson(user, rawTransfer){
    console.log("converting rawTransfer data: [%s]", rawTransfer);
    var isDebit = rawTransfer[0];
    var senderAddr = rawTransfer[1].toString();
    var receiverAddr = rawTransfer[2].toString();
    var sender, receiver;
    if(isDebit){
        sender = user;
        receiver = ethAuth.callGetUser(receiverAddr);
    } else{
        sender = ethAuth.callGetUser(senderAddr);
        receiver = user;
    }

    return {
        isDebit: rawTransfer[0],
        sender: sender.name,
        receiver: receiver.name,
        coinType: parseToCoinTypeEnum(rawTransfer[4]),
        amount: parseInt(rawTransfer[5]),
        feedbackRate: parseToFeedbackRateEnum(rawTransfer[6]),
        timestamp: parseInt(rawTransfer[7])
    }
}

function parseToClassEnum(rawClassType) {
    if(parseInt(rawClassType) == ClassTypeEnum.Practical){
        return "Practical";
    } else {
        return "Lecture";
    }
}

function parseToCoinTypeEnum(rawCoinType) {
    if(parseInt(rawCoinType) == CoinTypeEnum.Attendance){
        return "Attendance";
    } else {
        return "Feedback";
    }
}

function parseToFeedbackRateEnum(rawFeedback) {
    if(parseInt(rawFeedback) == FeedbackRateEnum.NA){
        return "NA";
    } else if(parseInt(rawFeedback) == FeedbackRateEnum.Poor){
        return "Poor";
    } else if(parseInt(rawFeedback) == FeedbackRateEnum.Average){
        return "Average";
    } else if(parseInt(rawFeedback) == FeedbackRateEnum.Good){
        return "Good";
    } else if(parseInt(rawFeedback) == FeedbackRateEnum.Excellent){
        return "Excellent";
    }
}