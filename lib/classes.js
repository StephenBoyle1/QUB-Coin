module.exports = {
    createNewClass: createNewClass,
    getClassesFor: getClassesFor,
    getAllClasses: getAllClasses
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
 * @returns The class object being created within the smart contract of that format (the id will be a unique address of the class contract within the blockchain):
 * {
 *  "classId": "0xfdccaa886d3dfdf1a157ad605ea4185d2f420a52",
 *  "name": "Networks",
 *  "location": "Room 1",
 *  "startTime": "09:00",
 *  "duration": 1,
 *  "date": "14/08/2016",
 *  "instructor": "instructor1@qub.ac.uk",
 *  "classType": "lecture"
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
 *  "instructor": "instructor1@qub.ac.uk",
 *  "classType": "lecture"
 * }
 */
function getClassesFor(authenticatedUser){
    var classesList = [];

    console.log("retrieving classes for user [%s], count=[%s]", authenticatedUser.accountId, authenticatedUser.numOfClasses);

    for(var index=1; index <= authenticatedUser.numOfClasses; index++){   // Starting INDEX at 1 here!!!
        classesList.push(qubCoinContract().getClassAtIndex(authenticatedUser.accountId, index));
    }

    console.log("Retrieved list of classes:" + classesList);
    return classesList;
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
 *  "instructor": "instructor1@qub.ac.uk",
 *  "classType": "lecture"
 * }
 */
function getAllClasses(){
    var numOfClasses = qubCoinContract().numOfClasses();
    var classesList = [];
    var thisClassAddress;

    console.log("retrieving all classes, count=[%s]", numOfClasses);
    for(var index=1; index <= numOfClasses; index++){   // Starting INDEX at 1 here!!!
        thisClassAddress = qubCoinContract().classesAddresses(index);
        classesList.push(
            convertRawClassDataToJson(
                qubCoinContract().getClassAtAddress(thisClassAddress),
                thisClassAddress
            )
        );
    }

    console.log("Retrieved list of classes: [%s]", classesList);
    return classesList;
}

function convertRawClassDataToJson(rawClass, classAddress){
    console.log("converting rawClass data: [%s]", rawClass);
    return {
        classId: classAddress,
        name: web3Wrapper().toUtf8(rawClass[1]),
        location: web3Wrapper().toUtf8(rawClass[2]),
        startTime: web3Wrapper().toUtf8(rawClass[3]),
        duration: parseInt(rawClass[4]),
        date: web3Wrapper().toUtf8(rawClass[5]),
        instructor: web3Wrapper().toUtf8(qubCoinContract().users(rawClass[0].toString())[2]), // index 2 is the name, 1 is email
        classType: web3Wrapper().toUtf8(rawClass[6])
    };
}