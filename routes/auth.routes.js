const express = require('express')
const bodyParser = require('body-parser')
var router = express.Router()
const authController = require('../controllers/auth.controller.js');



router.use(bodyParser.urlencoded({extended:false}))
router.use(bodyParser.json())


/**
 * @swagger
 * /auth/phone:
 *   post:
 *     summary: 전화번호 인증(카카오톡 알림톡 API로 링크 전송)(회원가입 시, 비밀번호 재설정 시)
 *     tags: [Auth]
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         schema:
 *           type: object
 *           required:
 *             - userID
 *           properties:
 *             userID:
 *               type: string
 *           example:  
 *             userID: "01022223333"
 *         description: |
 *          사용자 전화번호 전달
 *     responses:
 *       200:
 *         description: "success"
 *       400:
 *         description: "전화번호 형식 오류, 정보 누락"
 *       500:
 *         description : "DB 통신 오류 또는 카카오 메세지 전달 실패"
 */
router.post('/phone', authController.checkPhoneInput, authController.sendAuthLink)//해당 전화번호로 jwt 만들어서 링크 보냄 

router.get('/phone/verify/:token', authController.verify_token)//토큰받아서 그 토큰 안에 전화번호는 TEMP verify 시킴
/**
 * @swagger
 * /auth/login:
 *   get:
 *     summary: JWT 로그인
 *     tags: [Auth]
 *     parameters:
 *       - in: header
 *         type: http
 *         scheme: bearer
 *         name: Authorization
 *         description : 
 *           Bearer Auth
 *     responses:
 *       200:
 *         description: "성공"
 *         examples:
 *           application/json:
 *             {
 *               "userID": "01011112222",
 *               "name": "tester"
 *             }
 *       403:
 *         description: "토큰 인증 실패"
 *       404:
 *         description: "해당 유저 찾을 수 없음"
 *       500:
 *         description : "DB 통신 오류 등등 "
 */
router.get('/login',authController.auto_login)//토큰을 통한 자동 로그인 


module.exports = router;