const express = require('express')
const db = require('../model/db_connection.js')
const bodyParser = require('body-parser')
const app = express()
const moment = require('moment');
const TimeFilter = require('../model/TimeFilter.js')
const sanitizeHtml = require('sanitize-html');
var Promise = require('promise');


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

let getSeatStateList = function(req, res){//change needed 
	
	if(req.params.branchID == undefined || req.params.start == undefined || req.params.end == undefined ){
		res.status(400).json({error : "not enough data"});
	}
	var id = req.params.branchID;
	var startDateTime = req.params.start;
	var endDateTime = req.params.end;
	var startTime = moment(startDateTime).format("HH:mm");
	var endTime = moment(endDateTime).format("HH:mm");

	console.log(startTime);
	console.log(endTime);

	//isTimeAvailableInBranch 로 거른 다음에~
	//아레 조인에서 비즈니스 아워 체크하는거 뺴

	var sql = `SELECT seat.FK_SEAT_branchID, seat.seatID, DATE_FORMAT(rsrv.startTime, '%Y-%m-%d %H:%i') AS startTime,
	 	 DATE_FORMAT(rsrv.endTime, '%Y-%m-%d %H:%i') AS endTime, rsrv.FK_RSRV_userID FROM SEAT seat
		RIGHT JOIN BRANCH AS br ON (seat.FK_SEAT_branchID = br.branchID AND 
		br.businessHourStart <= STR_TO_DATE(?,'%H:%i') AND br.businessHourEnd >= STR_TO_DATE(?,'%H:%i') )
		LEFT JOIN RESERVATION AS rsrv ON 
		((STR_TO_DATE(?,'%Y-%m-%d %H:%i') <= rsrv.startTime AND
		 rsrv.startTime < STR_TO_DATE(? ,'%Y-%m-%d %H:%i')) OR 
		(STR_TO_DATE(?,'%Y-%m-%d %H:%i') < rsrv.endTime AND 
		rsrv.endTime <= STR_TO_DATE(?,'%Y-%m-%d %H:%i')) )
	    AND (rsrv.FK_RSRV_seatID = seat.seatID) WHERE seat.FK_SEAT_branchID = ?`;

	db.query(sql,[startTime, endTime, startDateTime, endDateTime,startDateTime, endDateTime,id ] ,function(err, results){
		if(err) throw err;
		console.log('this.sql', this.sql); 
		res.status(200).json(results);	
	})
}

let isSeatBooked = function(start, end, seatID){
	var sql = `SELECT * FROM amugong_db.RESERVATION WHERE (FK_RSRV_seatID = ?) AND 
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
	var sql = `SELECT br.branchID, seat.seatID FROM amugong_db.SEAT seat LEFT JOIN amugong_db.BRANCH br 
				ON seat.FK_SEAT_branchID = br.branchID 
			    WHERE seat.seatID = ?`;
	return new Promise(function(resolve, reject){
		db.query(sql , [seatID], function(err, results){
			if(err) {reject(err); return;};
			if(results.length > 0){
				isTimeAvailableInBranch(startDateTime , endDateTime, results[0].branchID)
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

let reserveSeat = async function(req, res){
	var purchasedAt = moment().format('YYYY-MM-DD HH:mm');
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
			res.status(400).send(err);
			return false;
		}
		if(avail == 0){
			res.status(403).send("NOT AVAILABLE");
			return false;
		}
		//중복 있나 체크 한 후에 삽입한다!!!!!!!!!
		var redunt;
		try{
			redunt = await isSeatBooked(data.startTime, data.endTime, data.seatID);
		}catch(err){
			res.status(400).send(err);
			return false;
		}
		if(redunt == 0){
			var sql = `INSERT INTO RESERVATION(FK_RSRV_userID, FK_RSRV_seatID, startTime, endTime, purchasedAt)
						VALUES(?,?,?,?,?)`;
			var params = [sanitizeHtml(data.userID), sanitizeHtml(data.seatID), sanitizeHtml(data.startTime)
						, sanitizeHtml(data.endTime), purchasedAt];
			db.query(sql, params, function(err, results){
				if(err) {res.status(400).send(err);};
				res.status(200).send("success");
			});
		}else{
			res.status(403).send("FILLED");
		}
	}
}

let deletRSRV;

	
let getMyReservation;


module.exports = {
	checkFilterInput : checkFilterInput,
	getSeatStateList : getSeatStateList,
	reserveSeat : reserveSeat
};