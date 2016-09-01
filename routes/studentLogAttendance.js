var express = require('express');
var router = express.Router();
var ethClasses = require('../lib/classes.js');


/* Get instructor-dashboard page. */
router.get('/', function (req, res, next) {
    if (req.session.authenticatedUsername && req.session.authenticatedUsername != '') {
        res.render('studentLogAttendance', {
            header: 'Student Log Attendance' ,
            theClass: ethClasses.getClassForAddress(req.query.classId)
        });
    } else {
        //redirecting to login page if current user is not registered onto the system
        console.log("req.session.User NOT authenticated, redirecting to login");
        res.redirect("login");
    }
});

router.post('/', function(req, res, next){
    try{
        ethClasses.logAttendanceFor(
            req.session.authenticatedUser.accountId,
            req.body.secret,
            req.query.classId,
            function(error, data){
                if (error) {
                    res.status(400).send({status: 'failed to log attendance', reason: error.toString()});
                } else {
                    console.log("logged attendance: %s", data);
                    res.status(201).redirect("/studentWallet");
                }
            }
        );
    } catch(error){
        console.log("Failed to log attendance [%s], error: %s", req.query.classId, error);
        res.status(500).send({status:'', reason: error});
    }
});


module.exports = router;
