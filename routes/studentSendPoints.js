var express = require('express');
var router = express.Router();
var ethClasses = require('../lib/classes.js');

/* Get instructor-dashboard page. */
router.get('/', function (req, res, next) {
    res.render('studentSendPoints', {
        header: 'Student Send Points' ,
        theClass: ethClasses.getClassForAddress(req.query.classId)
    });
});

router.post('/', function(req, res, next){
    try{
        ethClasses.sendCoins(
            req.session.authenticatedUser.accountId,
            req.query.classId,
            req.body.pointsAmount,
            req.body.feedbackRate,
            function(error, data){
                if (error) {
                    res.status(400).send({status: 'Failed to send points', reason: error.toString()});
                } else {
                    console.log("Points sent successfully: %s", data);
                    res.status(201).redirect("/studentWallet");
                }
            }
        );
    } catch(error){
        console.log("Failed to send coins for class [%s], error: %s", req.query.classId, error);
        res.status(500).send({status:'Failed to send coins', reason: error});
    }
});

module.exports = router;