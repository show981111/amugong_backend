const express = require('express')
const bodyParser = require('body-parser')
var router = express.Router()
const authController = require('../controllers/auth.controller.js');



router.use(bodyParser.urlencoded({extended:false}))
router.use(bodyParser.json())




router.get('/', (req, res) => {//특정유저 얻기 
  res.send('Hello World! AUTH')
})


router.post('/email', authController.checkEmailInput, authController.sendAuthEmail)//해당 이메일로 jwt 만들어서 링크 보냄 

router.get('/email/verify/:token', authController.verify_token)//토큰받아서 그 토큰 안에 이메일은 TEMP verify 시킴

router.post('/login',authController.auto_login)//토큰을 통한 자동 로그인 


module.exports = router;