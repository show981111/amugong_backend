const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const moment = require('moment');

const naver_map  = require('../config/naver_map.json');

var Promise = require('promise');


require('moment-timezone'); 
moment.tz.setDefault("Asia/Seoul");

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

console.log('map controller called');


var showMap = async function(req,res){
	
	var token = req.headers.authorization;
	// token = 'not';
	if(token == null && token.length < 8) {
		res.status(403).json({ error: err});
		return;
	}
	token = token.slice(7, token.length).trimLeft();
	console.log('token in show map');
	console.log(req.headers.authorization);
	var lat = req.params.lat;
	var long = req.params.long;
	var startDateTime = req.params.startDateTime;
	var endDateTime = req.params.endDateTime;	
	var input;
	if(startDateTime == undefined || endDateTime == undefined){
		input = {ID:naver_map.CLIENT_ID, firstLat : lat , firstLong : long, token: token};
	}else{
		input = {ID:naver_map.CLIENT_ID, firstLat : lat , firstLong : long, token: token,
						startDateTime : startDateTime ,endDateTime : endDateTime};
	}
	console.log(startDateTime);
	console.log(endDateTime);
	res.render('map',{ID:naver_map.CLIENT_ID, firstLat : lat , firstLong : long, token: token,
						startDateTime : startDateTime ,endDateTime : endDateTime}) ;
}

let showBranchLocationMap = async function(req, res){

	var lat = req.params.lat;
	var long = req.params.long;
	res.render('branchLocationMap',{ ID:naver_map.CLIENT_ID, firstLat : lat , firstLong : long }) ;
}



module.exports = {
	showMap : showMap,
	showBranchLocationMap : showBranchLocationMap
};