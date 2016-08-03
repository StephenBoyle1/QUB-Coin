/**
 * Created by linzi on 26/07/2016.
 */
var express = require('express');
var router = express.Router();
var inst = require('../instructor.json');


/* Get instructor-dashboard page. */
router.get('/', function(req, res, next){
  if(req.session.authenticatedUser && req.session.authenticatedUser != ''){
    res.render('studentLogAttendance', {
        header: 'Student Log Attendance' ,
        instructor: inst,
        authenticatedUser: req.session.authenticatedUser
    });
  } else {
    // This is what we should do, but since you may not have done the docker setup and run GETH successfully, it will stop you using that page,
    // So I am commenting this out for now:
    console.log("req.session.User NOT authenticated, redirecting to login");
    res.redirect("login");

    // console.log("User NOT authenticated, accepting for now, until we have GETH setup successfully...");
    // res.render('studentLogAttendance', {
    //     header: 'Student Log Attendance' ,
    //     instructor: inst,
    //     authenticatedUser: 'Anonymous Student'
    // });
  }
});


module.exports = router;
