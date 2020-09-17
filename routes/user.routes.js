const express = require('express')
const bodyParser = require('body-parser')
var router = express.Router()
const userController = require('../controllers/user.controller.js');


router.use(bodyParser.urlencoded({extended:false}))
router.use(bodyParser.json())




router.get('/', (req, res) => {//특정유저 얻기 
  res.send('Hello World! USER')
})


router.get('/:userID', userController.checkLoginInput, userController.getUserInfoByID)//특정 유저에 대한 정보 얻기...

router.post('/register', userController.checkRegisterInput, userController.registerUser)

router.post('/login',userController.checkLoginInput, userController.loginUser)

router.post('/reset', userController.reset_password)


module.exports = router;