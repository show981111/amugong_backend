const express = require('express')
const bodyParser = require('body-parser')
var router = express.Router()
const userController = require('../controllers/user.controller.js');


router.use(bodyParser.urlencoded({extended:false}))
router.use(bodyParser.json())




router.get('/', (req, res) => {//특정유저 얻기 
  res.send('Hello World! USER')
})
router.post('/register', userController.checkRegisterInput, userController.registerUser)
router.post('/login',userController.checkLoginInput, userController.loginUser)
router.post('/reset', userController.reset_password)

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: 회원가입
 *     tags: [User]
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
 *             userPassword:
 *               type: string
 *             name:
 *               type: string
 *             token:
 *               type: string
 *           example:  
 *             userID: "01022223333"
 *             userPassword: "1111"
 *             name: "tester"
 *             token: "efsafqw23ase1...푸쉬알림 토큰"
 *         description: |
 *          회원가입
 *     responses:
 *       200:
 *         description: "success"
 *       400:
 *         description: "전화번호 형식 오류 또는 데이터 누락"
 *       500:
 *         description : "기타 DB 통신 오류 또는 비밀번호 암호화 오류"
 */

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: 아이디 비밀번호로 로그인
 *     tags: [User]
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
 *             userPassword:
 *               type: string
 *           example:  
 *             userID: "01022223333"
 *             userPassword: "1111"
 *         description: |
 *          회원가입
 *     responses:
 *       200:
 *         description: "성공"
 *         examples:
 *           application/json:
 *             {
 *               "userID": "01011112222",
 *               "name": "tester",
 *               "issuedAt": "1604125611",
 *               "token": "푸쉬알림 토큰",
 *               "jwt": "asdasnjkdhaksjdnasjkdn....",
 *             }
 *       400:
 *         description: "전화번호 형식 오류 또는 데이터 누락"
 *       403:
 *         description: "JWT 생성 오류"
 *       404:
 *         description: "해당 유저 찾을 수 없음"
 *       500:
 *         description : "기타 DB 통신 오류"
 * /user/reset:
 *   post:
 *     summary: 비밀번호 리셋
 *     tags: [User]
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
 *             userPassword:
 *               type: string
 *           example:  
 *             userID: "01022223333"
 *             userPassword: "0000"
 *         description: |
 *          비밀번호 재설정
 *     responses:
 *       200:
 *         description: "success"
 *         examples:
 *           application/json:
 *             {
 *               "userID": "01011112222",
 *               "name": "tester",
 *               "issuedAt": "1604125611",
 *               "token": "푸쉬알림 토큰",
 *               "jwt": "asdasnjkdhaksjdnasjkdn....",
 *             }
 *       400:
 *         description: "데이터 누락"
 *       403:
 *         description: "전화번호 인증 안됨"
 *       404:
 *         description: "해당 유저 찾을 수 없음"
 *       500:
 *         description : "기타 DB 통신 오류 또는 비밀번호 암호화 오류"
 */



module.exports = router;