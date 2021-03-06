const db = require('../model/db_connection.js')
const moment = require('moment');
const TimeFilter = require('../model/TimeFilter.js')
const sanitizeHtml = require('sanitize-html');
const sendNotification = require('../utils/sendNotification.js')
var schedule = require('node-schedule');
var Promise = require('promise');


require('moment-timezone'); 
moment.tz.setDefault("Asia/Seoul");

console.log('visit controller called');

//enter/:branchID/:visitStartTime/:seatID/:num/:rsrv_startTime
let enter = async function(req, res){
	if(req.body.isKing == null|| req.body.num == null ||req.body.rsrv_startTime == null 
		||req.body.rsrv_endTime == null ||req.body.purchasedAt == null || req.body.seatID == null
		|| req.body.branchID == null || req.body.scanContent == null 
		)
	{
		res.status(500).send("null is included");
		return;
	}

	if(req.body.branchID != req.body.scanContent){
		res.status(405).send("wrong branch");
		return;
	}

	var rsrv_startTime = moment(req.body.rsrv_startTime , 'YYYY-MM-DD HH:mm', true);
	var rsrv_endTime = moment(req.body.rsrv_endTime , 'YYYY-MM-DD HH:mm', true);
	var purchasedAt = moment(req.body.purchasedAt , 'YYYY-MM-DD HH:mm:ss', true);

	if( moment(rsrv_startTime,'YYYY-MM-DD HH:mm').isValid() && moment(rsrv_endTime,'YYYY-MM-DD HH:mm').isValid()
		&& moment(purchasedAt,'YYYY-MM-DD HH:mm:ss').isValid()){
		var visitStartTime = moment().format('YYYY-MM-DD HH:mm');
		var gap = moment(visitStartTime,"YYYY-MM-DD HH:mm").diff(moment(rsrv_startTime,"YYYY-MM-DD HH:mm"));
		var d = moment.duration(gap);
		var diff = d.asMinutes();
		
		if(diff > -5 && diff <= 30){
			// var isSeatBranchMatch = `SELECT * FROM SEAT WHERE seatID = ? AND FK_SEAT_branchID = ?`;
			// db.query(isSeatBranchMatch, [req.body.seatID,req.body.branchID], function(err, results){
			// 	if(err){
			// 		res.status(500).send(err);
			// 		return;
			// 	}

			// 	if(results.length > 0){

			var sql = `UPDATE RESERVATION SET real_start = ?, isKing = ? WHERE num = ? AND startTime = ? AND FK_RSRV_userID = ? AND (real_start is NULL OR real_start = 0)`;
			var params = [visitStartTime,req.body.isKing, req.body.num,req.body.rsrv_startTime, req.token_userID];
			db.query(sql, params, function(err, results){
				if(err){
					res.status(500).send(err);
					return;
				}

				if(results.affectedRows > 0){
					//Enter 하고 나서 퇴장 푸쉬알림을 띄우는 부분!!! 10분 전부터 5분마다 띄운다~
					var fifBef = moment(req.body.rsrv_endTime, 'YYYY-MM-DD HH:mm').subtract(15, 'minutes');
					var halfMinAf = moment(req.body.rsrv_endTime, 'YYYY-MM-DD HH:mm').add(30, 'minutes');
					console.log(req.body.rsrv_endTime);
					console.log(fifBef);
					console.log(fifBef.toDate());
					var rule = new schedule.RecurrenceRule();
					
					//기존의 입장 전 알람과 입장 30분 뒤의 알림 삭제 
					var alarmID = req.token_userID+req.body.seatID+req.body.purchasedAt+'alarm';
					var enterCheckID = req.token_userID+req.body.seatID+req.body.purchasedAt+'enter';
					var alarm_job = schedule.scheduledJobs[alarmID];
					var enter_job = schedule.scheduledJobs[enterCheckID];
					if(alarm_job != undefined) alarm_job.cancel();
					if(enter_job != undefined) enter_job.cancel();
					//기존의 입장 전 알람과 입장 30분 뒤의 알림 삭제 

					rule.minute = new schedule.Range(0, 59, 5);
					var exitRecurAlaram = schedule.scheduleJob(req.body.num+ "out", { start: fifBef.toDate(),end :halfMinAf ,rule: rule }, function(data){
						var alarmTime = moment().format('YYYY-MM-DD HH:mm');
						var gap = moment(alarmTime,"YYYY-MM-DD HH:mm").diff(moment(data.rsrv_endTime,"YYYY-MM-DD HH:mm"));
						var d = moment.duration(gap);
						var diff = d.asMinutes();
						var message;
						if(diff < 0){
							message = '예약 종료' + (-diff) + '분 전 입니다!';
							console.log(-diff,'분 전 입니다.');
						}else{	
							message = '예약 종료' + (diff) + '분 후 입니다!';
							console.log(diff,'분 후 입니다.');
						}
						/////////////////////////////////////////////
						///여기서 real_end 가 null 인지 체크하고 푸쉬 띄움 //
						sendAlarmToExit(data.num, message);
						/////////////////////////////////////////////
						console.log('alarm Time ',alarmTime);
						console.log('diff ',diff);
						console.log(data);
					    console.log(rule);
					    console.log('recurrence from every 5 min');
					}.bind(null,req.body));

					var list = schedule.scheduledJobs;
					console.log(list);
					
					res.status(200).send("success");
				}else{
					res.status(404).send("not found");
				}
			})
			// 	}else{
			// 		res.status(400).send("seat and branch is not matched");
			// 	}
			// })
		}else{
			// console.log("Time Over");
			// console.log(res);
			res.status(400).send("Time Over");
		}
	}else{
		res.status(500).send("format error");
	}
}


let exit = function(req, res){
	if(req.body.seatID == null || req.body.num == null || req.body.rsrv_endTime == null || 
		req.body.branchID == null || req.body.scanContent == null )
	{
		res.status(400).send("null is included");
		return;
	}

	if(req.body.branchID != req.body.scanContent){
		res.status(405).send("wrong branch");
		return;
	}

	var rsrv_endTime = moment(req.body.rsrv_endTime , 'YYYY-MM-DD HH:mm', true);
	if(!moment(rsrv_endTime,'YYYY-MM-DD HH:mm').isValid()) {
		res.status(400).send("format error");
	}

	var sql = `UPDATE RESERVATION SET real_end = ? WHERE num = ? AND endTime = ? AND FK_RSRV_userID = ?
						AND FK_RSRV_seatID = ? AND (real_end is NULL OR real_end = 0)`;
	var exitTime = moment().format('YYYY-MM-DD HH:mm');
	var params = [exitTime, req.body.num, req.body.rsrv_endTime,req.token_userID, req.body.seatID];
	db.query(sql, params, function(err, results){
		if(err){
			res.status(500).send(err);
			return;
		}

		if(results.affectedRows > 0){
			var my_job = schedule.scheduledJobs[req.body.num + "out"];
			if(my_job != undefined) my_job.cancel();
			res.status(200).send("success");
			//만약 킹이 나갔다면? 
		}else{
			res.status(404).send("not found");
		}
	});


};

// let isKingExistNow = async function(branchID){
// 	var now = moment().format('YYYY-MM-DD HH:mm');
// 	var sql = `SELECT seat.*, rsrv.* FROM amugong_db.SEAT seat
// 		    RIGHT JOIN amugong_db.RESERVATION rsrv ON
// 		    seat.seatID = rsrv.FK_RSRV_seatID AND 
// 		    rsrv.real_end is null AND 
// 		    rsrv.endTime >= STR_TO_DATE(?,'%Y-%m-%d %H:%i') AND
// 		    rsrv.isKing = '1' AND rsrv.status = '1'
// 		    WHERE seat.FK_SEAT_branchID = ? LIMIT 1`;
// 	var params = [now, branchID];

// 	return new Promise(function(resolve, reject){
// 		db.query(sql, params, function(err, results){
// 			if(err) { reject(err); return; };
// 			console.log(results);
// 			if(results.length > 0){
// 				resolve(1);
// 			}else{
// 				resolve(0);
// 			}
// 		});
// 	});
// }

let isKingAvailable = function(req, res){
	var now = moment().format('YYYY-MM-DD HH:mm');
	var sql = `SELECT seat.*, rsrv.* FROM amugong_db.SEAT seat
		    RIGHT JOIN amugong_db.RESERVATION rsrv ON
		    seat.seatID = rsrv.FK_RSRV_seatID AND 
		    rsrv.real_end is null AND 
		    rsrv.endTime >= STR_TO_DATE(?,'%Y-%m-%d %H:%i') AND
		    rsrv.isKing = '1' AND rsrv.status = '1'
		    WHERE seat.FK_SEAT_branchID = ? LIMIT 1`;
	var params = [now, req.params.branchID];
	db.query(sql, params, function(err, results){
		if(err) { res.status(400).send(err); return; };
		console.log(results);
		if(results.length > 0){
			res.status(403).send("occupied");
		}else{
			res.status(200).send("possible");
		}
	});
}

let sendAlarmToExit = function(num, message){
	var sql = `SELECT user.token FROM amugong_db.RESERVATION rsrv
				LEFT JOIN amugong_db.USER user ON rsrv.FK_RSRV_userID = user.userID
			    WHERE rsrv.num = ? AND real_end is null`;
	db.query(sql, [num], function(err, results){
		if(err) { 
			console.log(err);
			return; 
		};
		console.log(results);
		if(results.length > 0){
			sendNotification(results[0]['token'], '예약시간 종료 알림', message);
		}else{
			var out_job = schedule.scheduledJobs[num+ "out"];
			if(out_job != undefined) out_job.cancel();
		}
	});
}

let sendNoti = function(req, res){
	sendNotification(`e1H5d0bcxUg7qXqtCOCOpK:APA91bEIuXmiN-jU_0bl7qJp99ECKpLsRlw0QpUvg-u-qDY34yG6A8B1Q98PtSgUFUJ3jwZfoCUYRhnCjl8ka7p1R4SWGLXJofOHYiF_tHKvNs60CmnjoMxh_Zo-FWd_mOZY37F2naJ0`
		, 'title', 'testingdasdasd');
	res.status(200).send('dsadas');
}


module.exports = {
	enter : enter,
	exit : exit,
	isKingAvailable : isKingAvailable,
	sendNoti : sendNoti
};