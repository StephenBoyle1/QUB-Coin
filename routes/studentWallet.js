var express = require('express');
var router = express.Router();
var ethClasses = require('../lib/classes.js');
var ethAuth = require('../lib/auth.js');
var transactionHistoryTable = require('../transactionHistory.json');


/* Get instructor-dashboard page. */
router.get('/', function (req, res, next) {
    if (req.session.authenticatedUsername && req.session.authenticatedUsername != '') {
        var refreshedAuthenticatedUser = ethAuth.callGetUser(req.session.authenticatedUser.accountId);
        res.render('studentWallet', {
            header: 'Student Wallet',
            authenticatedUser: refreshedAuthenticatedUser,
            classes: transactionHistoryTable,
            transfers: ethClasses.getTransfersFor(refreshedAuthenticatedUser)
        });
    } else {

        //redirecting to login page if current user is not registered onto the system
        console.log("req.session.authenticatedUsername NOT authenticated, redirecting to login");
        res.redirect("login");
    }
});

module.exports = router;