const express = require('express')
const bodyParser = require('body-parser')
var router = express.Router()
const branchController = require('../controllers/branch.controller.js');


router.use(bodyParser.urlencoded({extended:false}))
router.use(bodyParser.json())


router.get('/', branchController.getBranchList);
// router.get('/:minlat/:minlong/:maxlat/:maxlong', branchController.getBranchListInBox);
router.get('/:minlat/:minlong/:maxlat/:maxlong/:startTime/:endTime', branchController.getBranchListInBox);

//해당 날짜 받아서 해당 시간에 여는지 안여는지 체크해서 보여줘 
// router.get('/:ID', userController.checkRegisterInput, userController.registerUser)


module.exports = router;