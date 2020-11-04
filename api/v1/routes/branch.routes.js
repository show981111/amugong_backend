const express = require('express')
const bodyParser = require('body-parser')
var router = express.Router()
const branchController = require('../controllers/branch.controller.js');


router.use(bodyParser.urlencoded({extended:false}))
router.use(bodyParser.json())


// router.get('/', branchController.getBranchList);//위도 경도만으로 찾을수 있게 만들자~ 
router.get('/:minlat/:minlong/:maxlat/:maxlong/', branchController.getBranchListInBoxWithoutTime);
router.get('/:minlat/:minlong/:maxlat/:maxlong/:startTime/:endTime', branchController.getBranchListInBox);

/**
 * @swagger
 * /branch/{minlat}/{minlong}/{maxlat}/{maxlong}/{startTime}/{endTime}:
 *   get:
 *     summary: 해당 구역 내부에, 해당 시간 안에 영업 하는 업체 정보 가져옴
 *     tags: [Branch]
 *     parameters:
 *       - in: header
 *         type: http
 *         scheme: bearer
 *         name: Authorization
 *         description : 
 *           Bearer Auth
 *       - in: path
 *         name: minlat
 *         required: true
 *         schema:
 *           type: string
 *         example: "37.49095600"
 *         description : "조회하려는 latitude 최소값"
 *       - in: path	
 *         name: minlong
 *         required: true
 *         schema:
 *           type: string
 *         example: "127.02305990"
 *         description : "조회하려는 longitude 최소값"
 *       - in: path
 *         name: maxlat
 *         required: true
 *         schema:
 *           type: string
 *         example: "38.49095600"
 *         description : "조회하려는 latitude 최대값"
 *       - in: path	
 *         name: maxlong
 *         required: true
 *         schema:
 *           type: string
 *         example: "128.02305990"
 *         description : "조회하려는 longitude 최대값"
 *       - in: path	
 *         name: startTime
 *         required: true
 *         schema:
 *           type: string
 *         example: "2020-10-05 14:00"
 *         description : "조회하려는 시작 시간"
 *       - in: path	
 *         name: endTime
 *         required: true
 *         schema:
 *           type: string
 *         example: "2020-10-05 16:00"
 *         description : "조회하려는 끝나는 시간"
 *     responses:
 *       200:
 *         description: "지점 정보(key: 지점 아이디, value: 지점)"
 *         examples:
 *           application/json:
 *             {
 *                "1": {
 *                    "branchID": 1,
 *                    "branchName": "studyB",
 *                    "lat": 37.45,
 *                    "lng": 127.02311,
 *                    "address": "b",
 *                    "branchIntro": "This is Branch B",
 *                    "totalSeat": 0,
 *                    "curNum": 0,
 *                    "businessHour": [
 *                        {
 *                             "businessHourStart": "10:00",
 *                             "businessHourEnd": "23:59",
 *                             "dow": "1,2,3,4,5,6"
 *                         }
 *                     ]
 *                },
 *                "3": {
 *                    "branchID": 3,
 *                    "branchName": "studyD",
 *                    "lat": 37.52,
 *                    "lng": 127.01905,
 *                    "address": "d",
 *                    "branchIntro": "This is Branch D",
 *                    "totalSeat": 0,
 *                    "curNum": 0,
 *                    "businessHour": [
 *                        {
 *                            "businessHourStart": "09:00",
 *                            "businessHourEnd": "16:00",
 *                            "dow": "1,2,3,4"
 *                        },
 *                        {
 *                            "businessHourStart": "11:00",
 *                            "businessHourEnd": "15:00",
 *                            "dow": "5,6"
 *                        }
 *                    ]
 *                },
 *                "5": {
 *                    "branchID": 5,
 *                    "branchName": "studyA",
 *                    "lat": 37.490956,
 *                    "lng": 127.0230599,
 *                    "address": "a",
 *                    "branchIntro": "A지점 설명설명",
 *                    "totalSeat": 0,
 *                    "curNum": 0,
 *                    "businessHour": [
 *                        {
 *                            "businessHourStart": "09:00",
 *                            "businessHourEnd": "16:00",
 *                            "dow": "1,3,5,6,0"
 *                        }
 *                    ]
 *                }
 *             }
 *       403:
 *         description: "토큰 인증 실패"
 *       500:
 *         description: "시간 데이터 형식 오류 또는 기타 DB 통신 오류"
 * /branch/{lat}/{long}/:
 *   get:
 *     summary: 해당 구역 내부에 영업 하는 업체 정보 가져옴(시간 제약 없음)
 *     tags: [Branch]
 *     parameters:
 *       - in: header
 *         type: http
 *         scheme: bearer
 *         name: Authorization
 *         description : 
 *           Bearer Auth
 *       - in: path
 *         name: minlat
 *         required: true
 *         schema:
 *           type: string
 *         example: "37.49095600"
 *         description : "조회하려는 latitude 최소값"
 *       - in: path	
 *         name: minlong
 *         required: true
 *         schema:
 *           type: string
 *         example: "127.02305990"
 *         description : "조회하려는 longitude 최소값"
 *       - in: path
 *         name: maxlat
 *         required: true
 *         schema:
 *           type: string
 *         example: "38.49095600"
 *         description : "조회하려는 latitude 최대값"
 *       - in: path	
 *         name: maxlong
 *         required: true
 *         schema:
 *           type: string
 *         example: "128.02305990"
 *         description : "조회하려는 longitude 최대값"
 *     responses:
 *       200:
 *         description: "지점 정보(key: 지점 아이디, value: 지점)"
 *         examples:
 *           application/json:
 *             {
 *                "1": {
 *                    "branchID": 1,
 *                    "branchName": "studyB",
 *                    "lat": 37.45,
 *                    "lng": 127.02311,
 *                    "address": "b",
 *                    "branchIntro": "This is Branch B",
 *                    "totalSeat": 0,
 *                    "curNum": 0,
 *                    "businessHour": [
 *                        {
 *                             "businessHourStart": "10:00",
 *                             "businessHourEnd": "23:59",
 *                             "dow": "1,2,3,4,5,6"
 *                         }
 *                     ]
 *                },
 *                "3": {
 *                    "branchID": 3,
 *                    "branchName": "studyD",
 *                    "lat": 37.52,
 *                    "lng": 127.01905,
 *                    "address": "d",
 *                    "branchIntro": "This is Branch D",
 *                    "totalSeat": 0,
 *                    "curNum": 0,
 *                    "businessHour": [
 *                        {
 *                            "businessHourStart": "09:00",
 *                            "businessHourEnd": "16:00",
 *                            "dow": "1,2,3,4"
 *                        },
 *                        {
 *                            "businessHourStart": "11:00",
 *                            "businessHourEnd": "15:00",
 *                            "dow": "5,6"
 *                        }
 *                    ]
 *                },
 *                "5": {
 *                    "branchID": 5,
 *                    "branchName": "studyA",
 *                    "lat": 37.490956,
 *                    "lng": 127.0230599,
 *                    "address": "a",
 *                    "branchIntro": "A지점 설명설명",
 *                    "totalSeat": 0,
 *                    "curNum": 0,
 *                    "businessHour": [
 *                        {
 *                            "businessHourStart": "09:00",
 *                            "businessHourEnd": "16:00",
 *                            "dow": "1,3,5,6,0"
 *                        }
 *                    ]
 *                }
 *             }
 *       403:
 *         description: "토큰 인증 실패"
 *       500:
 *         description: "기타 DB 통신 오류"
 */

module.exports = router;