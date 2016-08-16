/**
 * Created by Linzi on 05/08/2016.
 */
var express = require('express');
var router = express.Router();
var studentsTable = require('../students.json');
var classesTable = require('../classes.json');
var ethClasses = require('../lib/classes.js');

/* Get adminClassesCreated page. */
router.get('/', function(req, res){
    res.render('adminEnrollStudent', {
        students: studentsTable,
        classes: classesTable,

        header: 'Admin Enroll Student',
        //TODO: hook this to the ethClass and remove hard-coded class sample
        // class: ethClasses.getClassForAddress(req.query.classId)
        theClass: {
            classId: "0xfdccaa886d3dfdf1a157ad605ea4185d2f420a52",
            name: "Programming",
            location: "Room 1",
            startTime: "09:00",
            duration: 1,
            date: "14/08/2016",
            instructor: "instructor1@qub.ac.uk",
            classType: "lecture"
        }

    });
});

module.exports = router;