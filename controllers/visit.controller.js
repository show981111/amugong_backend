const express = require('express')
const db = require('../model/db_connection.js')
const bodyParser = require('body-parser')
const app = express()
const moment = require('moment');
const TimeFilter = require('../model/TimeFilter.js')
const sanitizeHtml = require('sanitize-html');
var schedule = require('node-schedule');
var Promise = require('promise');


require('moment-timezone'); 
moment.tz.setDefault("Asia/Seoul");

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

console.log('visit controller called');

//enter/:branchID/:visitStartTime/:seatID/:num/:rsrv_startTime
let enter = function(req, res){
	if(req.body.branchID == null ||req.body.seatID == null ||
		req.body.num == null ||req.body.rsrv_startTime == null ||req.body.rsrv_endTime == null)
	{
		res.status(400).send("null is included");
		return;
	}

	var rsrv_startTime = moment(req.body.rsrv_startTime , 'YYYY-MM-DD HH:mm', true);
	var rsrv_endTime = moment(req.body.rsrv_endTime , 'YYYY-MM-DD HH:mm', true);


	if( moment(rsrv_startTime,'YYYY-MM-DD HH:mm').isValid() && moment(rsrv_endTime,'YYYY-MM-DD HH:mm').isValid()){
		var visitStartTime = moment().format('YYYY-MM-DD HH:mm');
		var gap = moment(visitStartTime,"YYYY-MM-DD HH:mm").diff(moment(rsrv_startTime,"YYYY-MM-DD HH:mm"));
		var d = moment.duration(gap);
		var diff = d.asMinutes();
		console.log(visitStartTime);
		console.log(diff);
		if(diff > -5 && diff <= 100){
			var isSeatBranchMatch = `SELECT * FROM SEAT WHERE seatID = ? AND FK_SEAT_branchID = ?`;
			db.query(isSeatBranchMatch, [req.body.seatID,req.body.branchID], function(err, results){
				if(err){
					res.status(400).send(err);
					return;
				}

				if(results.length > 0){
					var sql = `UPDATE RESERVATION SET real_start = ? WHERE num = ? AND startTime = ? AND FK_RSRV_userID = ?
						AND FK_RSRV_seatID = ? AND real_start is null `;
					var params = [visitStartTime, req.body.num,req.body.rsrv_startTime, req.token_userID, req.body.seatID];
					db.query(sql, params, function(err, results){
						if(err){
							res.status(400).send(err);
							return;
						}

						if(results.affectedRows >= 0){
							var endDateObj = moment(req.body.rsrv_endTime).toDate();
							var fiveBef = moment(req.body.rsrv_endTime, 'YYYY-MM-DD HH:mm').subtract(5, 'minutes');
							var tenBef = moment(req.body.rsrv_endTime, 'YYYY-MM-DD HH:mm').subtract(10, 'minutes');

							var befTen = schedule.scheduleJob(req.body.num + "bef10",tenBef.toDate(), function(data){
								console.log(data);
							  console.log('The world is going to end today. bef 10');//if not 퇴장 : 10분 전 알람 보내기
							}.bind(null,req.body));

							var befFive = schedule.scheduleJob(req.body.num+ "bef5",fiveBef.toDate(), function(data){
								console.log(data);
							  console.log('The world is going to end today. bef 5');//if not 퇴장 :5분 전 알람 보내기
							}.bind(null,req.body));

							var afterEnd = schedule.scheduleJob(req.body.num+ "bef0",endDateObj, function(data){
								console.log(data);
								//이 데이터에서 num 받아서 real_end == null 이라면 알람 보냄 
							  console.log('The world is going to end today. bef 0');//if not 퇴장 :0분 전 알람 보내기
							}.bind(null,req.body));
							//{ start: startTime, end: endTime, rule: '*/1 * * * * *' }
							var rule = new schedule.RecurrenceRule();

							rule.minute = new schedule.Range(0, 59, 5);
							var exitRecurAlaram = schedule.scheduleJob(req.body.num+ "af", { start: endDateObj, rule: rule }, function(data){
								console.log(data);
							    console.log(rule);
							    console.log('recurrence from every 5 min');
							}.bind(null,req.body));

							var list = schedule.scheduledJobs;
							console.log(list);
							// const jobNames = _.keys(schedule.scheduledJobs);
							// for(let name of jobNames) schedule.cancelJob(name);
							
 						// 	var my_job = schedule.scheduledJobs[unique_name];
						// my_job.cancel();
							res.status(200).send("success");
						}else{
							res.status(404).send("not found");
						}
					})
				}else{
					res.status(403).send("seat and branch is not matched");
				}
			})
		}else{
			res.status(403).send("Time Over");
		}
	}else{
		res.status(500).send("format error");
	}
}


let exit = function(req, res){
	if(req.body.seatID == null || req.body.num == null || req.body.rsrv_endTime == null)
	{
		res.status(400).send("null is included");
		return;
	}
	var rsrv_endTime = moment(req.body.rsrv_endTime , 'YYYY-MM-DD HH:mm', true);
	if(!moment(rsrv_endTime,'YYYY-MM-DD HH:mm').isValid()) {
		res.status(500).send("format error");
	}

	var sql = `UPDATE RESERVATION SET real_end = ? WHERE num = ? AND endTime = ? AND FK_RSRV_userID = ?
						AND FK_RSRV_seatID = ? AND real_end is null `;
	var exitTime = moment().format('YYYY-MM-DD HH:mm');
	var params = [exitTime, req.body.num, req.body.rsrv_endTime,req.token_userID, req.body.seatID];
	db.query(sql, params, function(err, results){
		if(err){
			res.status(400).send(err);
			return;
		}

		if(results.affectedRows > 0){
			var my_job = schedule.scheduledJobs[req.body.num + "af"];
			my_job.cancel();
			res.status(200).send("success");
		}else{
			res.status(400).send("not found");
		}
	});


};



module.exports = {
	enter : enter,

};