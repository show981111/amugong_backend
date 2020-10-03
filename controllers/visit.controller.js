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

console.log('visit controller called');

//enter/:branchID/:visitStartTime/:seatID/:num/:rsrv_startTime
let enter = function(req, res){
	if(req.params.branchID == null ||req.params.seatID == null ||
		req.params.num == null ||req.params.rsrv_startTime == null )
	{
		res.status(400).send("null is included");
		return;
	}

	var rsrv_startTime = moment(req.params.rsrv_startTime , 'YYYY-MM-DD HH:mm', true);

	if( moment(rsrv_startTime,'YYYY-MM-DD HH:mm').isValid()){
		var visitStartTime = moment().format('YYYY-MM-DD HH:mm');
		var gap = moment(visitStartTime,"YYYY-MM-DD HH:mm").diff(moment(rsrv_startTime,"YYYY-MM-DD HH:mm"));
		var d = moment.duration(gap);
		var diff = d.asMinutes();
		console.log(visitStartTime);
		console.log(diff);
		if(diff < 5){
			var sql = `UPDATE RESERVATION SET real_start = ? WHERE num = ? AND startTime = ? AND FK_RSRV_userID = ?
						AND FK_RSRV_seatID = ?`;
			var params = [visitStartTime, req.params.num,req.params.rsrv_startTime, req.token_userID, req.params.seatID];

		}
	}else{
		res.status(500).send("format error");
	}
}



module.exports = {
	enter : enter,

};