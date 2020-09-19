const express = require('express')
const db = require('../model/db_connection.js')
const User = require('../model/user.model.js')
const bodyParser = require('body-parser')
const app = express()
const moment = require('moment');
var fs = require('fs');

const naver_map  = require('../config/naver_map.json');
var path = require('path');
var root = path.resolve(__dirname);

var Promise = require('promise');


require('moment-timezone'); 
moment.tz.setDefault("Asia/Seoul");

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

console.log('map controller called');


let getBranchList = function(){
	return new Promise(function(resolve, reject){
		var sql = 'SELECT * FROM BRANCH';
		db.query(sql, function(err, results){
			if(err) throw err;

			resolve(results);
		})
	})
}

var showMap = async function(req,res){
	var lat = req.params.lat;
	var long = req.params.long;
	//console.log(__dirname );
	var branchList = await getBranchList();
	let path = __dirname.substr(0,__dirname.lastIndexOf('/'));
	console.log(path);
	//res.status(200).sendFile(path+'/webview/map.html');
	res.render('map',{ID:naver_map.CLIENT_ID}) ;
	// res.status(200).send(``)
}



module.exports = {
	showMap : showMap
};