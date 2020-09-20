const express = require('express')
const db = require('../model/db_connection.js')
const User = require('../model/user.model.js')
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
	// if (!req.headers.authorization) {
	//     return res.status(403).json({ error: 'No credential' });
	// }
	// if(!req.headers.authorization.startsWith('Bearer ')) {
	// 	return res.status(403).json({ error: 'No credential' });
	// }
	
	var token = req.headers.authorization;
	var token = "not";
	//token = token.slice(7, token.length).trimLeft();

	var lat = req.params.lat;
	var long = req.params.long;
	
	res.render('map',{ID:naver_map.CLIENT_ID, firstLat : lat , firstLong : long, token: token}) ;
}



module.exports = {
	showMap : showMap
};