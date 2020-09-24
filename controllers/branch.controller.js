const express = require('express')
const db = require('../model/db_connection.js')
const bodyParser = require('body-parser')
const app = express()
const moment = require('moment');

var Promise = require('promise');


require('moment-timezone'); 
moment.tz.setDefault("Asia/Seoul");

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

console.log('Branch controller called');

let getBranchList = function(req, res){
	
	var sql = 'SELECT * FROM BRANCH';
	db.query(sql, function(err, results){
		if(err) throw err;

		res.status(200).json(results);	
	})
}

let getBranchListInBox = function(req, res){

	var minlat = req.params.minlat;
	var minlong = req.params.minlong;
	var maxlat = req.params.maxlat;
	var maxlong = req.params.maxlong;

	var current_time = moment().format('YYYY-MM-DD HH:mm');
	console.log(current_time);

	// var sql = `SELECT DISTINCT br.*,  COUNT(rsrv.num) AS num FROM BRANCH br
	// 	LEFT JOIN SEAT AS st on (st.FK_SEAT_branchID = br.branchID) 
	// 	LEFT JOIN RESERVATION AS rsrv ON (rsrv.startTime <= ? AND 
	//     rsrv.endTime >?) AND (rsrv.FK_RSRV_seatID = st.seatID)
	//     WHERE br.lat >= ? AND br.lng >= ? AND br.lat <= ? AND br.lng <= ?
	//     GROUP BY br.branchID;`;
	// var params = [current_time,current_time,minlat, minlong, maxlat, maxlong];
	
	var sql = 'SELECT * FROM BRANCH WHERE lat >= ? AND lng >= ? AND lat <= ? AND lng <= ? ';
	var params = [minlat, minlong, maxlat, maxlong] ;
	db.query(sql,params ,function(err, results){
		if(err) throw err;
		console.log();
		res.status(200).json(results);	
	})
}

module.exports = {
	getBranchList : getBranchList,
	getBranchListInBox : getBranchListInBox
};