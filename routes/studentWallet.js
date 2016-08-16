var express = require('express');
var router = express.Router();
//var inst = require('../instructor.json');
var transactionHistoryTable = require('../transactionHistory.json');


/* Get instructor-dashboard page. */
router.get('/', function (req, res, next) {
    if (req.session.authenticatedUsername && req.session.authenticatedUsername != '') {
        res.render('studentWallet', {
            header: 'Student Wallet',
            authenticatedUser: req.session.authenticatedUser,
            classes: transactionHistoryTable
        });
    } else {

        //redirecting to login page if current user is not registered onto the system
        console.log("req.session.authenticatedUsername NOT authenticated, redirecting to login");
        res.redirect("login");
    }
});

module.exports = router;