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
        // This is what we should do, but since you may not have done the docker setup and run GETH successfully, it will stop you using that page,
        // So I am commenting this out for now:
        console.log("req.session.authenticatedUsername NOT authenticated, redirecting to login");
        res.redirect("login");
    }
});

module.exports = router;