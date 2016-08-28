/**
 * Created by Linzi on 05/08/2016.
 */
var express = require('express');
var router = express.Router();
var ethAuth = require('../lib/auth.js');
var ethClasses = require('../lib/classes.js');

router.get('/', function (req, res) {
    res.render('adminEnrollStudent', {
        theClass: ethClasses.getClassForAddress(req.query.classId),
        instructors: ethAuth.callGetInstructorList(),
        students: ethAuth.callGetStudentList(),
        header: 'Admin Enroll Student'
    });
});

router.post('/', function (req, res, next) {
    ethClasses.enrollStudentsToClass(
        req.session.authenticatedUser.accountId,
        req.body.selectedStudents,
        req.body.classId, function (error, data) {
            if (error) {
                res.status(400).send({status: 'Failed to enroll student', reason: error.toString()});
            } else {
                console.log("Student enrolled successfully: %s", data);
                res.status(200).redirect("/adminClassesCreated");
            }
        });
});

function createJsonArrayFrom(checkboxes){
    console.log("checkboxes= %s", checkboxes);
    var selected = [];
    for (var i=0; i< checkboxes.length; i++) {
        selected.push(checkboxes[i]);
    }
    console.log("selected= %s, %j", checkboxes, selected);
    return selected;
}

module.exports = router;