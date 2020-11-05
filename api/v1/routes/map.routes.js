const express = require('express')
const bodyParser = require('body-parser')
var router = express.Router()
const mapController = require('../controllers/map.controller.js');


router.use(bodyParser.urlencoded({extended:false}))
router.use(bodyParser.json())

router.get('/:lat/:long',mapController.showMap)
router.get('/:lat/:long/:startDateTime/:endDateTime',mapController.showMap)
/**
 * @swagger
 * /map/{lat}/{long}/{startDateTime}/{endDateTime}:
 *   get:
 *     summary: 지도 뷰 렌더링(해당 시간대에 문을 여는 업체만 표시 )
 *     tags: [Map]
 *     parameters:
 *       - in: header
 *         type: http
 *         scheme: bearer
 *         name: Authorization
 *         description : 
 *           Bearer Auth
 *       - in: path
 *         name: lat
 *         required: true
 *         schema:
 *           type: string
 *         example: "37.49095600"
 *         description : "사용자 latitude"
 *       - in: path	
 *         name: long
 *         required: true
 *         schema:
 *           type: string
 *         example: "127.02305990"
 *         description : "사용자 longitude"
 *       - in: path	
 *         name: startDateTime
 *         required: true
 *         schema:
 *           type: string
 *         example: "2020-10-05 14:00"
 *         description : "조회하려는 시작 시간"
 *       - in: path	
 *         name: endDateTime
 *         required: true
 *         schema:
 *           type: string
 *         example: "2020-10-05 16:00"
 *         description : "조회하려는 끝나는 시간"
 *     responses:
 *       200:
 *         description: "성공 -> 지도뷰 보여줌 -> 바로 branch get 호출됨"
 *       403:
 *         description: "토큰 인증 실패"
 * /map/{lat}/{long}/:
 *   get:
 *     summary: 지도 뷰 렌더링(시간 제약 없음)
 *     tags: [Map]
 *     parameters:
 *       - in: header
 *         type: http
 *         scheme: bearer
 *         name: Authorization
 *         description : 
 *           Bearer Auth
 *       - in: path
 *         name: lat
 *         required: true
 *         schema:
 *           type: string
 *         example: "37.49095600"
 *         description : "사용자 latitude"
 *       - in: path	
 *         name: long
 *         required: true
 *         schema:
 *           type: string
 *         example: "127.02305990"
 *         description : "사용자 longitude"      
 *     responses:
 *       200:
 *         description: "성공 -> 지도뷰 보여줌 -> 바로 branch get 호출됨"
 *       403:
 *         description: "토큰 인증 실패"
 */

module.exports = router;