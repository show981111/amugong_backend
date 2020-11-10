const express = require('express')
const bodyParser = require('body-parser')
var router = express.Router()
const resourcesController = require('../controllers/resources.controller.js');


router.use(bodyParser.urlencoded({extended:false}))
router.use(bodyParser.json())



router.get('/:branchID/:key',resourcesController.downloadImage)
router.get('/:branchID',resourcesController.getImageKeyList)
router.post('/upload', resourcesController.upload.array('branchImage' , 10) ,resourcesController.uploadImage)

/**
 * @swagger
 * /resources/{branchID}/:
 *   get:
 *     summary: 해당 지점의 사진의 키값들 리스트를 가져온다
 *     tags: [Resource]
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
 *         example: "3"
 *         description : "키값들을 가져오려는 지점 아이디"   
 *     responses:
 *       200:
 *         description: "성공, 해당 지점에 저장되어 있는 사진들의 키값들의 리스트를 반환"
 *         examples:
 *           application/json:
 *             [
 *                "test1.png",
 *                "test2.png",
 *                "testImage.png"
 *             ]
 *       403:
 *         description: "토큰 인증 실패"
 *       "기타": 
 *         description: "Amazon S3 통신 오류 'https://docs.aws.amazon.com/AmazonS3/latest/API/ErrorResponses.html#ErrorCodeList'"
 * /resources/{branchID}/{key}:
 *   get:
 *     summary: 해당 지점의, 해당 키에 해당하는 사진 다운로드 
 *     tags: [Resource]
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
 *         example: "3"
 *         description : "해당 지점의 아이디"
 *       - in: path	
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         example: "testImage.png"
 *         description : "다운받으려는 사진 이름"
 *     responses:
 *       200:
 *         description: "성공하면 이미지 로딩"
 *       403:
 *         description: "토큰 인증 실패"
 *       "기타": 
 *         description: "Amazon S3 통신 오류 'https://docs.aws.amazon.com/AmazonS3/latest/API/ErrorResponses.html#ErrorCodeList'"
 */
module.exports = router;