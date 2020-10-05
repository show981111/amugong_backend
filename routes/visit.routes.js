const express = require('express')
const bodyParser = require('body-parser')
var router = express.Router()
const visitController = require('../controllers/visit.controller.js');


router.use(bodyParser.urlencoded({extended:false}))
router.use(bodyParser.json())



router.put('/enter',visitController.enter);
router.put('/exit',visitController.exit);
router.get('/king/:branchID',visitController.isKingAvailable);
// 입장 : 유저가 큐알을 찍으면, 그 큐알에서 branchID 추출, 그리고 유저가 찍을때 seatID 와 visitStartTime, num, rsrv_startTime 추출
// 이때 퇴장 5분전 푸쉬알림 스케쥴러 찍어 놓기, 퇴장 정각 에 푸쉬알림(유저가 퇴장한 상태가 아니라면)
//입장시간 이후 30분 후에도 입장안하면 status = 0 만들기 

// router.put('/eixt/:branchID/:visitEndTime/:seatID/:num/:rsrv_endTime',visitController.exit)
// 퇴장 : 유저가 큐알을 찍으면, 그 큐알에서 branchID 추출, 그리고 유저가 찍을때 seatID와 visitEndTime, num, rsrv_endTime 추출
//

module.exports = router;