const express = require('express')
const bodyParser = require('body-parser')
var router = express.Router()
const reservationController = require('../controllers/reservation.controller.js');


router.use(bodyParser.urlencoded({extended:false}))
router.use(bodyParser.json())

router.get('/seat/:branchID/:start/:end', reservationController.checkFilterInput, reservationController.getSeatStateList);
router.post('/seat', reservationController.reserveSeat);



module.exports = router;