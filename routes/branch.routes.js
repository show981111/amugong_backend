const express = require('express')
const bodyParser = require('body-parser')
var router = express.Router()
const branchController = require('../controllers/branch.controller.js');


router.use(bodyParser.urlencoded({extended:false}))
router.use(bodyParser.json())


router.get('/', branchController.getBranchList);
router.get('/:minlat/:minlong/:maxlat/:maxlong', branchController.getBranchListInBox);

// router.get('/:ID', userController.checkRegisterInput, userController.registerUser)


module.exports = router;