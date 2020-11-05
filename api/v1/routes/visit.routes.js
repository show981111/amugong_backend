const express = require('express')
const bodyParser = require('body-parser')
var router = express.Router()
const visitController = require('../controllers/visit.controller.js');


router.use(bodyParser.urlencoded({extended:false}))
router.use(bodyParser.json())



router.put('/enter',visitController.enter);
router.put('/exit',visitController.exit);
// router.get('/king/:branchID',visitController.isKingAvailable);

// 입장 : 유저가 큐알을 찍으면, 그 큐알에서 branchID 추출, 그리고 유저가 찍을때 seatID 와 visitStartTime, num, rsrv_startTime 추출
// 이때 퇴장 5분전 푸쉬알림 스케쥴러 찍어 놓기, 퇴장 정각 에 푸쉬알림(유저가 퇴장한 상태가 아니라면)
//입장시간 이후 30분 후에도 입장안하면 status = 0 만들기 

// router.put('/eixt/:branchID/:visitEndTime/:seatID/:num/:rsrv_endTime',visitController.exit)
// 퇴장 : 유저가 큐알을 찍으면, 그 큐알에서 branchID 추출, 그리고 유저가 찍을때 seatID와 visitEndTime, num, rsrv_endTime 추출
//


/**
 * @swagger
 * /visit/enter:
 *   put:
 *     summary: 입장 큐알 찍으면 입장 처리 + 퇴장 전 10분전 부터 퇴장 푸쉬알림 예약 / 
 *     tags: [Visit]
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         type: http
 *         scheme: bearer
 *         name: Authorization
 *         description : 
 *           Bearer Auth
 *       - in: body
 *         schema:
 *           type: object
 *           properties:
 *             num:
 *               type: string
 *             isKing:
 *               type: string
 *             seatID:
 *               type: string
 *             rsrv_startTime:
 *               type: string
 *             rsrv_endTime:
 *               type: string
 *             purchasedAt:
 *               type: string
 *           example:  
 *             num: "7"
 *             isKing: "0"
 *             seatID: "5"
 *             rsrv_startTime: "2020-11-09 13:00"
 *             rsrv_endTime: "2020-11-09 12:00"
 *             purchasedAt: "2020-11-09 13:00:23"
 *         description: |
 *          "isKing 의 경우 0 또는 1/ purchaseAt 의 형식은 YYYY-MM-DD HH:mm:ss 나머지는 YYYY-MM-DD HH:mm"
 *     responses:
 *       200:
 *         description: "success"
 *       400:
 *         description: "날짜 형식 오류 또는 body data 부족 또는 입장 시간이 아님(Time Over)"
 *       403:
 *         description: "토큰 인증 실패"
 *       404:
 *         description: "일치하는 예약 찾지 못함 또는 이미 입장 처리가 됨"
 *       500:
 *         description : "기타 DB 통신 오류 및 서버 에러"
 * /visit/exit:
 *   put:
 *     summary: 퇴장 큐알 찍으면 퇴장 처리
 *     tags: [Visit]
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         type: http
 *         scheme: bearer
 *         name: Authorization
 *         description : 
 *           Bearer Auth
 *       - in: body
 *         schema:
 *           type: object
 *           properties:
 *             num:
 *               type: string
 *             seatID:
 *               type: string
 *             rsrv_endTime:
 *               type: string
 *           example:  
 *             num: "28"
 *             seatID: "6"
 *             rsrv_endTime: "2020-11-05 11:30"
 *         description: |
 *          num(예약 번호), seatID(예약좌석 아이디), rsrv_endTime(원래 예약 끝나는 시간)
 *     responses:
 *       200:
 *         description: "success"
 *       400:
 *         description: "날짜 형식 오류 또는 body data 부족"
 *       403:
 *         description: "토큰 인증 실패"
 *       404:
 *         description: "일치하는 예약 찾지 못함 또는 이미 퇴장 처리가 됨"
 *       500:
 *         description : "기타 DB 통신 오류 및 서버 에러"
 */

module.exports = router;