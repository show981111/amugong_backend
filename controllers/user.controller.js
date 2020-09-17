const express = require('express')
const db = require('../model/db_connection.js')
const User = require('../model/user.model.js')
const bodyParser = require('body-parser')
const app = express()
const crypto = require('crypto');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const jwt_config  = require('../config/db-jwt-config.json');

const secret_key = jwt_config.secret_key;


var Promise = require('promise');


require('moment-timezone'); 
moment.tz.setDefault("Asia/Seoul");

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

console.log('controller called');

var checkLoginInput =  function(req,res,next){
	console.log(req.params);
	var data;
	if (req.method == "POST") {
       data = req.body;
    }else if (req.method == "GET") {
       data = req.params;
    }
	const user = new User(data);
	user.validateUserInput();
	if(user.errors.length > 0){
		res.status(500).send(user.errors[0]);
	}else{
		next();
	}
}

var checkRegisterInput = function(req,res,next){
	console.log("get middleware");
	const user = new User(req.body);
	user.validateRegisterInput();
	if(user.errors.length > 0){
		res.status(500).send(user.errors[0]);
	}else{
		next();
	}
}

var findUserByID = function(userID, callback){
	console.log("find user called");
	var sql = 'SELECT * FROM USER WHERE userID = ? ';
	//var sql = 'SELECT * FROM users_customuser';
	db.query(sql ,[userID] , callback);
	//res.status(200).json(userInfo);
}



var getUserInfoByID = function(req, res){

	console.log(req.params.userID);
	// var uesrPassword = req.userPassword;
	//var sql = 'SELECT * FROM users_customuser';
	var response;
	findUserByID(req.params.userID, function (error, results, fields) {
		if (error) throw error;
		if(results.length > 0){
			response = results;
			response[0].password = undefined;
			console.log(response);
			
		}else{
			res.status(404).send("not found");
		}
	});
	//res.status(200).json(userInfo);
	
}

let isVerified = function(userID){
	var sql = 'SELECT isVerified, issuedAt FROM TEMPUSER WHERE userEmail = ?';
	console.log(userID);
	return new Promise(function(resolve, reject){
		db.query(sql, [userID], function(err, results, fields){
			if(err) throw err;
			console.log(results);
			if(results.length > 0){
				var current_time = moment().unix()

				console.log(current_time - results[0].issuedAt );
				if(results[0].isVerified == 1 && current_time - results[0].issuedAt < 180 ){
					resolve("verified")
				}else{
					reject("Forbidden");
				}
			}else{
				reject("Not found");
			}
		});
	})
}

let cryptoPassword = function(userPassword, salt){
	
	return new Promise(function(resolve, reject){
		crypto.randomBytes(64, (err, buf) => {
		if(salt == null) salt = buf.toString('base64');
		console.log("salt into DB", salt);
		crypto.pbkdf2(userPassword, salt, 100000, 64, 'sha512', (err, key) => {
				if(err) throw err;
				hashedPW = key.toString('base64');
				resolve([hashedPW, salt]);
			});
		});
	});
}
 

let registerUser = async function(req, res){

	try{
		var verification_result = await isVerified(req.body.userID);
	}catch(err){
		res.status(403).send(err);
		return false;
	}
	
	var salt;
	var hashedPW;
	try{
		var arr_hashInfo = await cryptoPassword(req.body.userPassword, null)
	}catch(err){
		res.status(500).send(err);
		return false;
	}
	hashedPW = arr_hashInfo[0];
	salt = arr_hashInfo[1];
	console.log(hashedPW);
	console.log(salt);

	var sql = 'INSERT INTO USER(userID, name, password, token, salt)'+
				' VALUES (?,?,?,?,?)  ';
	var params = [req.body.userID, req.body.name, hashedPW, req.body.token, salt];

	findUserByID(req.body.userID, function (error, results, fields) {
	  if (error) throw error;
	  if(results.length > 0){
	  	res.status(500).send('redundant');
	  }else{
	  	db.query(sql , params ,function (error, results, fields) {
		  if (error) throw error;
		  res.status(200).send('success');
		});
	  }
	})

}

let verifyPassword = function(userID, inputPassword){
	var sql = 'SELECT salt, password FROM USER WHERE userID = ?';
	return new Promise(function(resolve, reject){
		db.query(sql, [userID], function(error, results, fields){
			if(error) {
				return reject(error);
			}
			if(results.length > 0){
				crypto.pbkdf2(inputPassword, results[0].salt , 100000, 64, 'sha512', (err, key) => {
					if(key.toString('base64') == results[0].password){
						resolve('success');
				  	}else{
				  		reject("password incorrect");
		  			}
				});
			}else{
				reject("none");
			}
			
		})
	});
}

let signJWT = function(userInfo){
	return new Promise((resolve, reject) => {
		var current_time = moment().unix()
		jwt.sign({
			    userID: userInfo.userID,
			    userName: userInfo.name,
			    iat : current_time
			}, 
			secret_key, 
			{
	            expiresIn: '90d',
	            issuer: 'amugong',
	            subject: 'userInfo',
	        }, 
			function(err, token) {
				if(err) reject(err);
			  	//console.log(token);
			  	//여기서 Iat을 DB에 꽂아주기! 
			  	var sql = 'UPDATE USER SET issuedAt = ? WHERE userID = ?';
			  	db.query(sql, [current_time,userInfo.userID], function(error, results, fields){
			  		if(error) throw error;
			  		if(results.affectedRows > 0){
			  			resolve(token);
			  		}else{
			  			reject("not found");
			  		}
			  	})
			}
		)
	})
}


let loginUser = async function(req, res){//token을 발급해준다 
	
	var response =  verifyPassword(req.body.userID, req.body.userPassword).then(function(value){
		if(value == 'success'){
			findUserByID(req.body.userID, async function (error, userInfo, fields) {
				if (error) throw error;
				if(userInfo.length > 0){
					userInfo[0].password = undefined;
					userInfo[0].num = undefined;
					userInfo[0].salt = undefined;
					const signed_jwt = await signJWT(userInfo[0]);//jwt 발급 
					userInfo[0].jwt = signed_jwt;
					var iat = signed_jwt;
					res.status(200).json(userInfo);					
				}else{
					res.status(404).send("not found");
				}
			});
		}else{
			res.status(500).send(value);
		}
	})
	.catch(error => res.status(500).send(error));
	//var sql = 'SELECT * FROM users_customuser';
	
}





let reset_password = async function(req, res){

	if(req.body.userID == null ||req.body.userPassword == null){
		res.status(500).send("no info");
		return false;
	}

	try{
		var verification_result = await isVerified(req.body.userID);
	}catch(err){
		res.status(403).send(err);
		return false;
	}
	
	var salt;
	var hashedPW;
	try{
		var arr_hashInfo = await cryptoPassword(req.body.userPassword, null)
	}catch(err){
		res.status(500).send(err);
		return false;
	}
	hashedPW = arr_hashInfo[0];
	salt = arr_hashInfo[1];
	console.log(hashedPW);
	console.log(salt);

	var sql = 'UPDATE USER SET password = ?, salt = ? WHERE userID = ?';
	var params = [ hashedPW, salt, req.body.userID];
	db.query(sql, params, function(error, results, fields){
  		if(error) throw error;
  		if(results.affectedRows > 0){
  			res.status(200).send("success");
  		}else{
  			res.status(404).send("user is not found");
  		}

  	})
}


module.exports = {
	checkLoginInput : checkLoginInput,
	checkRegisterInput : checkRegisterInput,
	getUserInfoByID : getUserInfoByID,
	registerUser : registerUser,
	loginUser : loginUser,
	reset_password : reset_password
};