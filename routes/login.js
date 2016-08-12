/**
 * Created by Stephen on 26/07/2016.
 */
var express = require('express');
var router = express.Router();
var ethAuth = require('../lib/auth.js');

//var html = new EJS({url: 'instructorDashboard.ejs'}).render(data);

/* Get instructor-dashboard page. */
router.get('/', function (req, res, next) {
    res.render('login', {
        header: 'login'
    });
});

router.post('/', function (req, res, next) {
    var user = ethAuth.login(req.body.username, req.body.password);
    if (user) {
        req.session.authenticatedUsername = user.email;
        req.session.authenticatedUser = user;
        if(user.isAdmin){
            res.status(200).redirect("/adminClassesCreated");
        } else if(!user.isStudent){
            res.status(200).redirect("/instructorDashboard");
        } else{
            res.status(200).redirect("/studentWallet");
        }
    } else {
        req.session.authenticatedUser = '';
        req.session.authenticatedUser = null;
        res.status(401).send({status: 'You have entered the wrong username or password'});
        // res.locals.errors = req.flash('error');
    }
});

module.exports = router;
