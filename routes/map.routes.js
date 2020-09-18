const express = require('express')
const bodyParser = require('body-parser')
var router = express.Router()
const mapController = require('../controllers/map.controller.js');


router.use(bodyParser.urlencoded({extended:false}))
router.use(bodyParser.json())




router.get('/:lat/:lang',mapController.showMap)



module.exports = router;