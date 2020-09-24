const express = require('express')
const db = require('../model/db_connection.js')
const bodyParser = require('body-parser')
const app = express()
const moment = require('moment');
const TimeFilter = require('../model/TimeFilter.js')

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

let getSeatStateList = function(req, res){
	
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

let reserveSeat = function(req, res){
	console.log(req.body);
	var data = req.body;
	const timeFilter = new TimeFilter(data);
	timeFilter.validateReservationInput();
	if(timeFilter.errors.length > 0){
		res.status(500).send(timeFilter.errors[0]);
	}else{
		res.status(200).send("GOOD");
	}
}

	
let getMyReservation;


module.exports = {
	checkFilterInput : checkFilterInput,
	getSeatStateList : getSeatStateList,
	reserveSeat : reserveSeat
};