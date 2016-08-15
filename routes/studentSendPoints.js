/**
 * Created by linzi on 26/07/2016.
 */
var express = require('express');
var router = express.Router();
var inst = require('../instructor.json');
var ethClasses = require('../lib/classes.js');

/* Get instructor-dashboard page. */
router.get('/', function (req, res, next) {
    res.render('studentSendPoints', {


        header: 'Student Send Points',
        instructor: inst,
        //TODO: hook this to the ethClass and remove hard-coded class sample
        // class: ethClasses.getClassForAddress(req.query.classId)
        theClass: {
            classId: "0xfdccaa886d3dfdf1a157ad605ea4185d2f420a52",
            name: "Networks",
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