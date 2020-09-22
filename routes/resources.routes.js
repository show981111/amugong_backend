const express = require('express')
const bodyParser = require('body-parser')
var router = express.Router()
const resourcesController = require('../controllers/resources.controller.js');


router.use(bodyParser.urlencoded({extended:false}))
router.use(bodyParser.json())



router.get('/:branchID/:key',resourcesController.downloadImage)
router.get('/key/:branchID',resourcesController.getImageKeyList)
router.post('/upload',resourcesController.upload.array('branchImage' , 10) ,resourcesController.uploadImage)


module.exports = router;