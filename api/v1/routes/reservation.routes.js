const express = require('express')
const bodyParser = require('body-parser')
var router = express.Router()
const reservationController = require('../controllers/reservation.controller.js');


router.use(bodyParser.urlencoded({extended:false}))
router.use(bodyParser.json())

router.get('/:term', reservationController.getMyReservation);
router.get('/seat/:branchID/:startTime/:endTime', reservationController.checkFilterInput, reservationController.getSeatStateList);
router.delete('/:num', reservationController.deleteReservation);
router.post('/seat', reservationController.reserveSeat);
// router.put('/extend/', reservationController.extendReservation);
// router.put('/paid/', reservationController.updatePaidStatus);
module.exports = router;
/**
 * @swagger
 * /reservation/{term}:
 *   get:
 *     summary: 사용자의 예약 내역 가져옴(월별 조회)
 *     tags: [Reservation]
 *     parameters:
 *       - in: header
 *         type: http
 *         scheme: bearer
 *         name: Authorization
 *         description : 
 *           Bearer Auth
 *       - in: path
 *         name: term
 *         required: true
 *         schema:
 *           type: string
 *         example: "2020-11"
 *         description : "조회하려는 달 YYYY-MM"
 *     responses:
 *       200:
 *         description: "성공"
 *         examples:
 *           application/json:
 *             [
 *                {
 *                    "num": 18,
 *                    "FK_RSRV_userID": "01011112222",
 *                    "FK_RSRV_seatID": 3,
 *                    "startTime": "2020-10-04 23:15",
 *                    "endTime": "2020-10-04 23:30",
 *                    "real_start": "2020-10-04 23:40",
 *                    "real_end": "2020-10-05 00:04",
 *                    "isKing": "1",
 *                    "purchasedAt": "2020-09-26 01:06",
 *                    "merchant_uid": "",
 *                    "status": 1,
 *                    "isPaid": 1
 *                },
 *                {
 *                   "num": 21,
 *                    "FK_RSRV_userID": "01011112222",
 *                    "FK_RSRV_seatID": 3,
 *                    "startTime": "2020-10-05 23:46",
 *                    "endTime": "2020-10-05 23:51",
 *                    "real_start": null,
 *                    "real_end": null,
 *                    "isKing": null,
 *                    "purchasedAt": "2020-10-05 23:45",
 *                    "merchant_uid": "",
 *                    "status": 0,
 *                    "isPaid": 1
 *                }
 *             ]
 *       403:
 *         description: "토큰 인증 실패"
 *       500:
 *         description: "날짜 형식 오류 또는 기타 오류"
 * /reservation/seat/{branchID}/{startTime}/{endTime}:
 *   get:
 *     summary: 해당 지점에 해당 시간 동안 좌석 현황을 가져온다
 *     tags: [Reservation]
 *     parameters:
 *       - in: header
 *         type: http
 *         scheme: bearer
 *         name: Authorization
 *         description : 
 *           Bearer Auth
 *       - in: path
 *         name: branchID
 *         required: true
 *         schema:
 *           type: string
 *         example: "1"
 *         description : "조회하려는 지점 아이디"
 *       - in: path
 *         name: startTime
 *         required: true
 *         schema:
 *           type: string
 *         example: "2020-11-09 12:00"
 *         description : "조회하려는 시작 시간(YYYY-MM-DD HH:mm)"
 *       - in: path
 *         name: endTime
 *         required: true
 *         schema:
 *           type: string
 *         example: "2020-11-09 13:00"
 *         description : "조회하려는 끝 시간(YYYY-MM-DD HH:mm)"
 *     responses:
 *       200:
 *         description: "성공"
 *         examples:
 *           application/json:
 *             [
 *                {
 *                    "FK_SEAT_branchID": 1,
 *                    "seatID": 1,
 *                    "startTime": null,
 *                    "endTime": null,
 *                    "real_start": null,
 *                    "real_end": null,
 *                    "FK_RSRV_userID": null,
 *                    "num": null
 *                },
 *                {
 *                    "FK_SEAT_branchID": 1,
 *                    "seatID": 2,
 *                    "startTime": "2020-11-09 12:00",
 *                    "endTime": "2020-11-09 14:30",
 *                    "real_start": null,
 *                    "real_end": null,
 *                    "FK_RSRV_userID": "b@gmail.com",
 *                    "num": 8
 *                }
 *             ]
 *       403:
 *         description: "토큰 인증 실패"
 *       404:
 *         description: "해당시간에 지점이 영업중이 아님"
 *       500:
 *         description: "날짜 형식 오류(오늘 이전의 날짜이거나 등등) 또는 기타 오류"
 * /reservation/{num}:
 *   delete:
 *     summary: 사용자의 예약 취소
 *     tags: [Reservation]
 *     parameters:
 *       - in: header
 *         type: http
 *         scheme: bearer
 *         name: Authorization
 *         description : 
 *           Bearer Auth
 *       - in: path
 *         name: num
 *         required: true
 *         schema:
 *           type: string
 *         example: "7"
 *         description : "삭제하려는 예약 아이디 "
 *     responses:
 *       200:
 *         description: "success"
 *       403:
 *         description: "토큰 인증 실패"
 *       404:
 *         description: "일치하는 예약을 찾을 수 없음"
 *       500:
 *         description: "기타 오류"
 * /reservation/seat:
 *   post:
 *     summary: 예약 잡기 
 *     tags: [Reservation]
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
 *             seatID:
 *               type: string
 *             startTime:
 *               type: string
 *             endTime:
 *               type: string
 *           example:  
 *             seatID: "7"
 *             startTime: "2020-11-09 12:00"
 *             endTime: "2020-11-09 13:00"
 *         description: |
 *          자리 예약
 *     responses:
 *       200:
 *         description: "success"
 *         examples:
 *           application/json:
 *             [
 *                {
 *                    "status": "success",
 *                    "purchasedAt": "2020-11-04 20:04:44"
 *                }
 *             ]
 *       400:
 *         description: "전화번호 형식 오류 또는 데이터 누락"
 *       403:
 *         description: "토큰 인증 실패"
 *       404:
 *         description: "해당 시간 예약 불가(이미 차있거나 영업시간이 아닌 경우)"
 *       500:
 *         description : "기타 DB 통신 오류 및 서버 에러"
 */


