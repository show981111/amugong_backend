const express = require('express')
const db = require('../model/db_connection.js')
const bodyParser = require('body-parser')
const app = express()
const moment = require('moment');
const TimeFilter = require('../model/TimeFilter.js')
const sanitizeHtml = require('sanitize-html');
var Promise = require('promise');
var schedule = require('node-schedule');


require('moment-timezone'); 
moment.tz.setDefault("Asia/Seoul");

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

console.log('reservation controller called');

var checkFilterInput =  function(req,res,next){
	console.log(req.params);
	var data;
    data = req.params;
    
	const timeFilter = new TimeFilter(data);
	timeFilter.validateUserInput();
	if(timeFilter.errors.length > 0){
		res.status(500).send(timeFilter.errors[0]);
	}else{
		next();
	}
}
//get current seat state 

let getSeatStateList = async function(req, res){//change needed 
	
	if(req.params.branchID == undefined || req.params.startTime == undefined || req.params.endTime == undefined ){
		res.status(500).send( "not enough data");
	}
	var id = req.params.branchID;
	var startDateTime = req.params.startTime;
	var endDateTime = req.params.endTime;
	// var startTime = moment(startDateTime).format("HH:mm");
	// var endTime = moment(endDateTime).format("HH:mm");

	// console.log(startTime);
	// console.log(endTime);
	try{
		var checkBH = await isTimeAvailableInBranch(startDateTime, endDateTime, id);

	}catch(err){
		res.status(500).send(err);
		return;
	}
	if(checkBH != 1){
		res.status(404).send("time is not available for the branch");
		return;
	}
	//rsrv.startTime < [real_end(과거) < startDate(미래) < rsrv.endTime(미래)] 이라면 예약 가능 
	var sql = `SELECT seat.FK_SEAT_branchID, seat.seatID, DATE_FORMAT(rsrv.startTime, '%Y-%m-%d %H:%i') AS startTime,
		 	 DATE_FORMAT(rsrv.endTime, '%Y-%m-%d %H:%i') AS endTime, DATE_FORMAT(rsrv.real_start, '%Y-%m-%d %H:%i') AS real_start,
		 	 DATE_FORMAT(rsrv.real_end, '%Y-%m-%d %H:%i') AS real_end, rsrv.FK_RSRV_userID , rsrv.num
		 	 FROM amugong_db.SEAT seat
			LEFT JOIN amugong_db.RESERVATION AS rsrv ON 
			((STR_TO_DATE(?,'%Y-%m-%d %H:%i') <= rsrv.startTime AND
			 rsrv.startTime < STR_TO_DATE(? ,'%Y-%m-%d %H:%i')) OR 
			(STR_TO_DATE(?,'%Y-%m-%d %H:%i') < rsrv.endTime AND 
			rsrv.endTime <= STR_TO_DATE(?,'%Y-%m-%d %H:%i')) )
		    AND (rsrv.FK_RSRV_seatID = seat.seatID ) AND real_end is NULL 
	        AND rsrv.status = '1'
		    WHERE seat.FK_SEAT_branchID = ?`;
	    //현재 사용중인 자리를 보여줌.  real_end !=NULL 이라면 무조건 사용 가능! 
	db.query(sql,[startDateTime, endDateTime,startDateTime, endDateTime,id ] ,function(err, results){
		if(err) {
			res.status(500).send(err);
			return;
		};
		for(var i = 0; i < results.length ; i++){
			if(results[i].real_end != null){
				var real_end = moment(results[i].real_end).format('YYYY-MM-DD HH:mm');

			}
		}
		res.status(200).json(results);	
	})
}

//rsrv.startTime < [real_end(과거) < startDate(미래) < rsrv.endTime(미래)] 이라면 예약 가능 
let isSeatBooked = function(start, end, seatID){
	var sql = `SELECT * FROM amugong_db.RESERVATION WHERE (FK_RSRV_seatID = ? AND status = '1' AND real_end is NULL) AND 
		(( (startTime <= STR_TO_DATE(? ,'%Y-%m-%d %H:%i') AND endTime > STR_TO_DATE(? ,'%Y-%m-%d %H:%i') )) OR
		( (startTime < STR_TO_DATE(? ,'%Y-%m-%d %H:%i') AND endTime >= STR_TO_DATE(? ,'%Y-%m-%d %H:%i') )))`;

	var params = [seatID, start,start, end,end];	
	return new Promise(function(resolve, reject){
		db.query(sql, params, function(err, results){
			if(err) { reject(err); return; };
			console.log('this.sql', this.sql); 
			console.log(results);
			if(results.length > 0){
				resolve(1);
			}else{
				resolve(0);
			}
		});
	});
}

let isTimeAvailableInBranch = function(startDateTime, endDateTime, branchID){
	var startTime = moment(startDateTime).format("HH:mm");
	var endTime = moment(endDateTime).format("HH:mm");
	var dow = moment(startDateTime).day();
	console.log(startTime);
	console.log(endTime);
	console.log(dow);
	var sql = `SELECT br.branchID, bh.businessHourStart, bh.businessHourEnd, dow FROM amugong_db.BRANCH br
				 LEFT JOIN amugong_db.BUSINESSHOUR bh ON
					(br.branchID = bh.FK_BHOUR_branchID AND
				    (bh.businessHourStart <= STR_TO_DATE(?,'%H:%i' )
				    AND bh.businessHourEnd >= STR_TO_DATE(?,'%H:%i' )))
				    WHERE branchID = ? AND FIND_IN_SET(?, bh.dow) > 0`;

    return new Promise(function(resolve, reject){
    	db.query(sql,[startTime, endTime, branchID, dow], function(err, results){
    		if (err || results === undefined) {reject(err); return;};
    		console.log(results);
    		if(results.length > 0){
    			resolve(1);
    		}else{
    			resolve(0);
    		}


    	})
    });
}

let isTimeAvailableForSeat = async function(startDateTime, endDateTime, seatID){
	var sql = `SELECT seat.FK_SEAT_branchID, seat.seatID FROM amugong_db.SEAT seat 
			    WHERE seat.seatID = ?  LIMIT 1`;
	return new Promise(function(resolve, reject){
		db.query(sql , [seatID], function(err, results){
			if(err) {reject(err); return;};
			if(results.length > 0){
				isTimeAvailableInBranch(startDateTime , endDateTime, results[0].FK_SEAT_branchID)
				.catch(function(err){
					reject(err);
					return;
				})
				.then(function(result){
					resolve(result);
				})

			}else{
				resolve(0);
			}
		});
	});
}

let reserveSeat = async function(req, res){//결제 시작하면 일단 예약 인서트 해준다 
	console.log("reserve seat called ");
	var purchasedAt = moment().format('YYYY-MM-DD HH:mm:ss');
	console.log(req.body);
	var data = req.body;
	const timeFilter = new TimeFilter(data);
	timeFilter.validateReservationInput();
	
	if(timeFilter.errors.length > 0){
		res.status(500).send(timeFilter.errors[0]);
	}else{
		var avail;
		try{
			avail = await isTimeAvailableForSeat(data.startTime, data.endTime, data.seatID);
		}catch(err){
			res.status(500).send(err);
			return false;
		}
		if(avail == 0){
			res.status(404).send("not available");
			return false;
		}
		//중복 있나 체크 한 후에 삽입한다!!!!!!!!!
		var redunt;
		try{
			redunt = await isSeatBooked(data.startTime, data.endTime, data.seatID);
		}catch(err){
			res.status(500).send(err);
			return false;
		}
		if(redunt == 0){
			var sql = `INSERT INTO RESERVATION(FK_RSRV_userID, FK_RSRV_seatID, startTime, endTime, purchasedAt)
						VALUES(?,?,?,?,?)`;
			var params = [sanitizeHtml(req.token_userID), sanitizeHtml(data.seatID), sanitizeHtml(data.startTime)
						, sanitizeHtml(data.endTime), purchasedAt];
			db.query(sql, params, function(err, results){
				if(err) {res.status(500).send(err);};

				
				//var checkPaymentID = req.token_userID+data.seatID+purchasedAt+'pay';//3분까지 결제 데드라인 
				/////////////////////FCM TODO //////////////////////////
				// var scheduleID = req.token_userID+data.seatID+purchasedAt+'alarm';//시작하기 5분 10분 전 알림 
				/////////////////////FCM TODO //////////////////////////
				var enterCheckID = req.token_userID+req.body.seatID+purchasedAt+'enter';//시작하고 나서 30분 뒤에도 안오면 취

				var schedule_info = {
					userID : req.token_userID,
					seatID : req.body.seatID,
					purchasedAt : purchasedAt
				};

				// var checkPaymentDeadLine = moment(purchasedAt,'YYYY-MM-DD HH:mm:ss').add(3, 'minutes');
				// var paymentJob = schedule.scheduleJob(checkPaymentID , checkPaymentDeadLine.toDate(), function(data){
				// 	var sql = `UPDATE RESERVATION SET status = IF(isPaid=0,0,1) 
				// 		WHERE FK_RSRV_userID = ? AND FK_RSRV_seatID = ? AND purchasedAt = ?`;
				// 	var paramVal = [req.token_userID, data.seatID, data.purchasedAt];
				// 	db.query(sql, paramVal, function(err, results){
				// 		if(err) {
				// 			var id = req.token_userID+data.seatID+data.purchasedAt+'pay';
				// 			console.log(id ,err); 
				// 			return;
				// 		}
				// 	});//3분 뒤에도 pay가 안되어있다면 취소 
				// }.bind(null,schedule_info));

				var cancelDeadLine = moment(data.endTime,'YYYY-MM-DD HH:mm').add(30, 'minutes');
				var alarmForCancel = schedule.scheduleJob(enterCheckID , cancelDeadLine.toDate(), function(data){
					var sql = `UPDATE RESERVATION SET status = IF(real_start is null,0,1) WHERE 
						FK_RSRV_userID = ? AND FK_RSRV_seatID = ? AND purchasedAt = ?`;
					var paramVal = [req.token_userID, data.seatID, data.purchasedAt];
					db.query(sql, paramVal, function(err, results){
						if(err) {
							var id = req.token_userID+data.seatID+data.purchasedAt+'pay';
							console.log(id ,err); 
							return;
						}
					});//예약 시작시간으로부터 30분 뒤에도 입장 안했으면 예약 취소
				}.bind(null,schedule_info));

				console.log(checkPaymentDeadLine);
				console.log(cancelDeadLine);

				var list = schedule.scheduledJobs;
				console.log(list);	
				
				res.status(200).json({status : "success", purchasedAt : purchasedAt});
				// 여기서 끝나는 시간 30분 후에 스케쥴러 해서 그떄 real_start is NUll status = 1로 업데이트 
			});
		}else{
			res.status(404).send("filled");
		}
	}
}

let updatePaidStatus = function(req, res){
	// req.token_userID+data.seatID+purchasedAt

	if(req.token_userID == null && req.body.seatID == null && req.body.purchasedAt == null){
		res.status(400).send("null value included");
		return;
	}
	var sql = `UPDATE RESERVATION SET isPaid = '1' WHERE FK_RSRV_userID = ? AND FK_RSRV_seatID = ? AND purchasedAt = ?`;
	var prarams = [req.token_userID, req.body.seatID, req.body.purchasedAt];
	db.query(sql, params, function(err, results){
		if(err) {
			res.status(400).send(err);
			return;
		}
		if(results.affectedRows > 0){
			var checkPayment = req.token_userID+req.body.seatID+req.body.purchasedAt+'pay';
			var pay_job = schedule.scheduledJobs[checkPayment];
			if(pay_job != undefined) pay_job.cancel();
			res.status(200).send('success');
		}else{
			res.status(404).send('not found');
		}
	})
}


// let deleteReservationDuetoUnp

let deleteReservation = function(req, res){
	console.log("delete called");
	if("num" in req.params &&req.token_userID != undefined){
		// var startTime = moment(req.params.startTime , 'YYYY-MM-DD HH:mm', true);
		var num = req.params.num;
		var userID = req.token_userID;

		// if(moment(startTime, 'YYYY-MM-DD HH:mm').isValid())
		// {
		// 	startTime = moment(startTime).format('YYYY-MM-DD HH:mm');

		var sql = "DELETE FROM RESERVATION WHERE num = ? AND FK_RSRV_userID = ? ";
		db.query(sql, [num, userID], function(err, results){
			if(err) {
				res.status(500).send(err);
				return;
			};

			if(results.affectedRows > 0){
				res.status(200).send("success");
			}else{
				res.status(404).send("not found");
			}
		});
		// }else{
		// 	res.status(500).send("Format error");
		// }
	}else{
		res.status(500).send("not enough data");
	};
}



let getMyReservation = function(req, res){
	if(req.params.term == undefined || req.token_userID == undefined){
		res.status(500).send("not enough data");
		return;
	}
	var curTerm = moment(req.params.term , 'YYYY-MM', true);
	if(moment(curTerm, 'YYYY-MM').isValid()){
		var curMonth = moment(curTerm).format('MM');
		var curYear = moment(curTerm).format('YYYY');
		var sql = `SELECT *, DATE_FORMAT(startTime, '%Y-%m-%d %H:%i') AS startTime, DATE_FORMAT(endTime, '%Y-%m-%d %H:%i') AS endTime,
					DATE_FORMAT(real_start, '%Y-%m-%d %H:%i') AS real_start, DATE_FORMAT(real_end, '%Y-%m-%d %H:%i') AS real_end,
					DATE_FORMAT(purchasedAt, '%Y-%m-%d %H:%i') AS purchasedAt
				 	FROM RESERVATION WHERE MONTH(startTime) = ? AND YEAR(startTime) = ? AND 
					FK_RSRV_userID = ?`;
		var params = [curMonth, curYear, req.token_userID];

		db.query(sql, params, function(err,results){
			if(err) {
				res.status(500).send(err);
				return;
			}
			res.status(200).json(results);
			
		})
	}else{
		res.status(500).send("Format error");
	}
};

let extendReservation = function(req, res){
	//:num/:originEndDate/:newEndDate
	if(req.body.originEndDate != undefined && req.body.newEndDate != undefined
	 && req.token_userID != undefined && req.body.num != undefined){

	 	var originEndDate = moment(req.body.originEndDate , 'YYYY-MM-DD HH:mm', true);
		var newDate = moment(req.body.newEndDate , 'YYYY-MM-DD HH:mm', true);
		if(moment(newDate,'YYYY-MM-DD HH:mm').isValid() && moment(originEndDate,'YYYY-MM-DD HH:mm').isValid()){

			if(newDate.isBefore(originEndDate)) {
				res.status(500).send("new date is faster");
				return;
			}
			originEndDate = moment(originEndDate).format('YYYY-MM-DD HH:mm');
			newDate = moment(newDate).format('YYYY-MM-DD HH:mm');

			var sql = `UPDATE RESERVATION SET endTime = ? WHERE FK_RSRV_userID = ? AND num = ? AND endTime = ?`;
			var params = [newDate, req.token_userID, req.body.num, originEndDate];
			db.query(sql, params, function(err, results){
				if (err){
					res.status(400).send(err);
					return;
				}
				console.log(this.sql);
				if(results.affectedRows > 0){
					//////
					//여기서 스케쥴러 기존 끝나는 알림 스케줄 끄고 다시 다 설정한다! 
					var job_id = req.body.num+ "out";
					var jot_out = schedule.scheduledJobs[job_id];
					if(jot_out != undefined) jot_out.cancel();
					/////
					//끝나는 스케쥴러 다시 잡아주기!!!
					////
					res.status(200).send("success");

				}else{
					res.status(404).send("NOT FOUND");
				}
			});

		}else{
			res.status(500).send("Format error");
		}
	}else{
		res.status(500).send("not enough data");
	}
};


module.exports = {
	checkFilterInput : checkFilterInput,
	getSeatStateList : getSeatStateList,
	reserveSeat : reserveSeat,
	deleteReservation : deleteReservation,
	getMyReservation : getMyReservation,
	extendReservation : extendReservation,
	updatePaidStatus : updatePaidStatus
};