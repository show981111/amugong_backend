const express = require('express')
const db = require('../model/db_connection.js')
const TimeFilter = require('../model/TimeFilter.js')
const bodyParser = require('body-parser')
const app = express()
const moment = require('moment');

var Promise = require('promise');


require('moment-timezone'); 
moment.tz.setDefault("Asia/Seoul");

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

console.log('Branch controller called');

let getBranchList = function(req, res){//lat 이랑 long 만 가지고 branch 얻기 
	
	var sql = 'SELECT * FROM BRANCH';
	db.query(sql, function(err, results){
		if(err) throw err;

		res.status(200).json(results);	
	})
}
let getBranchListInBoxWithoutTime = function(req , res){
	var minlat = req.params.minlat;
	var minlong = req.params.minlong;
	var maxlat = req.params.maxlat;
	var maxlong = req.params.maxlong;

	var sql = `SELECT br.* , DATE_FORMAT(bh.businessHourStart, '%H:%i') AS businessHourStart, 
				DATE_FORMAT(bh.businessHourEnd, '%H:%i') AS businessHourEnd, bh.dow
				FROM amugong_db.BRANCH br
 				LEFT JOIN amugong_db.BUSINESSHOUR bh ON br.branchID = bh.FK_BHOUR_branchID
 				WHERE lat >= ? AND lng >= ? AND lat <= ? AND lng <= ? order by br.branchID`;
	var params = [minlat, minlong, maxlat, maxlong];
	
	// var sql = 'SELECT * FROM BRANCH WHERE lat >= ? AND lng >= ? AND lat <= ? AND lng <= ? ';
	// var params = [minlat, minlong, maxlat, maxlong] ;
	makeBranchJsonOb(sql,params, res);
}

let getBranchListInBox = function(req, res){

	var minlat = req.params.minlat;
	var minlong = req.params.minlong;
	var maxlat = req.params.maxlat;
	var maxlong = req.params.maxlong;
	var startDateTime = req.params.startTime;
	var endDateTime = req.params.endTime;

	const timeFilter = new TimeFilter(req.params);
	timeFilter.validateTime();

	if(timeFilter.errors.length > 0){
		res.status(500).send(timeFilter.errors[0]);
		return;
	}
	var startTime = moment(startDateTime).format("HH:mm");
	var endTime = moment(endDateTime).format("HH:mm");
	var dow = moment(startDateTime).day();

	var sql = `SELECT br.*, DATE_FORMAT(bh1.businessHourStart, '%H:%i') AS businessHourStart, 
					DATE_FORMAT(bh1.businessHourEnd, '%H:%i') AS businessHourEnd, 
					bh1.dow FROM amugong_db.BRANCH br
				 	LEFT JOIN amugong_db.BUSINESSHOUR bh ON
					(br.branchID = bh.FK_BHOUR_branchID AND
				    (bh.businessHourStart <= STR_TO_DATE(?,'%H:%i' )
				    AND bh.businessHourEnd >= STR_TO_DATE(?,'%H:%i' )))
				    LEFT JOIN amugong_db.BUSINESSHOUR bh1 ON
					(bh.FK_BHOUR_branchID = bh1.FK_BHOUR_branchID)
				    WHERE FIND_IN_SET(?, bh.dow) > 0 AND 
				    lat >= ? AND lng >= ? AND lat <= ? AND lng <= ? order by br.branchID`;
	var params = [startTime, endTime, dow, minlat, minlong, maxlat, maxlong];
	
	// var sql = 'SELECT * FROM BRANCH WHERE lat >= ? AND lng >= ? AND lat <= ? AND lng <= ? ';
	// var params = [minlat, minlong, maxlat, maxlong] ;
	makeBranchJsonOb(sql,params, res);
}

let makeBranchJsonOb = function(sql,params,res){
	db.query(sql,params ,function(err, results){
		if(err) throw err;
		console.log();
		var prevID = -1 ;
		var index = 0;
		var branchObj = new Object();
		for(var i  = 0; i < results.length ; i++){
			if(!branchObj.hasOwnProperty(results[i].branchID))
			{
				var jsonOb = new Object();
				jsonOb.branchID = results[i].branchID;
				jsonOb.branchName = results[i].branchName;
				jsonOb.lat = results[i].lat;
				jsonOb.lng = results[i].lng;
				jsonOb.address = results[i].address;
				jsonOb.branchIntro = results[i].branchIntro;
				jsonOb.totalSeat = results[i].totalSeat;
				jsonOb.curNum = results[i].curNum;
				jsonOb.businessHour = [];
				jsonOb.businessHour.push({
					"businessHourStart" : results[i].businessHourStart,
					"businessHourEnd" : results[i].businessHourEnd,
					"dow" : results[i].dow
				});
				branchObj[results[i].branchID] = jsonOb;
			}else{
				branchObj[results[i].branchID].businessHour.push({
					"businessHourStart" : results[i].businessHourStart,
					"businessHourEnd" : results[i].businessHourEnd,
					"dow" : results[i].dow
				});
			}
		}
		console.log(branchObj);
		res.status(200).json(branchObj);	
	})
}

module.exports = {
	getBranchList : getBranchList,
	getBranchListInBox : getBranchListInBox,
	getBranchListInBoxWithoutTime : getBranchListInBoxWithoutTime
};