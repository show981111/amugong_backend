const express = require('express')
const db = require('../model/db_connection.js')
const User = require('../model/user.model.js')
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


module.exports = {
	getBranchList : getBranchList
};