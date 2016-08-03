/**
 * Created by Stephen on 26/07/2016.
 */
var express = require('express');
var router = express.Router();
var ethAuth = require('../lib/auth.js');

//var html = new EJS({url: 'instructorDashboard.ejs'}).render(data);

/* Get instructor-dashboard page. */
router.get('/', function(req, res, next){
    res.render('login', {
        header: 'login'
    });
});

router.post('/', function(req, res, next){
   if(ethAuth.login(req.body.username, req.body.password)){
       req.session.authenticatedUser = req.body.username;
       res.status(200).redirect("/studentLogAttendance");
   } else {
       req.session.authenticatedUser = '';
       res.status(401).send({status:'Login failed'});
   }
});

module.exports = router
