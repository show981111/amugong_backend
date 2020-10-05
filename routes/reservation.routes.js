const express = require('express')
const bodyParser = require('body-parser')
var router = express.Router()
const reservationController = require('../controllers/reservation.controller.js');


router.use(bodyParser.urlencoded({extended:false}))
router.use(bodyParser.json())

router.get('/:term', reservationController.getMyReservation);
router.get('/seat/:branchID/:startTime/:endTime', reservationController.checkFilterInput, reservationController.getSeatStateList);
router.delete('/:num/:startTime', reservationController.deleteReservation);
router.post('/seat', reservationController.reserveSeat);
router.put('/extend/', reservationController.extendReservation);
router.put('/paid/', reservationController.updatePaidStatus);



module.exports = router;