/**
 * Created by Stephen on 26/07/2016.
 */
var express = require('express');
var router = express.Router();
var ethAuth = require('../lib/auth.js');
var ethClasses = require('../lib/classes.js');

/* Get instructor-dashboard page. */
router.get('/', function(req, res, next){
    res.render('adminCreateClass', {
        header: 'adminCreateClass',
        instructors: ethAuth.callGetInstructorList()
    })
});

router.post('/', function (req, res, next) {
    ethClasses.createNewClass(
        req.session.authenticatedUser.accountId,
        req.body.inputName,
        req.body.inputLocation,
        req.body.inputTime,
        req.body.inputDuration,
        req.body.inputDate,
        req.body.inputInstructor,
        req.body.inputClassType, function(error, data){
            if (error) {
                res.status(400).send({status: 'Failed to create class', reason: error.toString()});
            } else {
                console.log("Class created successfully: %s", data);
                res.status(200).redirect("/adminClassesCreated");
            }
        });
});


module.exports = router;