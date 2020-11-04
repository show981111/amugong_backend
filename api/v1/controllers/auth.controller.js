const express = require('express')
const db = require('../model/db_connection.js')
const User = require('../model/user.model.js')
const bodyParser = require('body-parser')
const app = express()
const moment = require('moment');
const jwt = require('jsonwebtoken');
const smtp_config  = require('../config/smtp.json');
const nodemailer = require('nodemailer');
const jwt_config  = require('../config/db-jwt-config.json');

const secret_key = jwt_config.secret_key;

var Promise = require('promise');


require('moment-timezone'); 
moment.tz.setDefault("Asia/Seoul");

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

var checkPhoneInput =  function(req,res,next){
	var data;
	if (req.method == "POST") {
       data = req.body;
    }else if (req.method == "GET") {
       data = req.params;
    }
	const user = new User(data);
	user.validateUserInput();
	if(user.errors.length > 0){
		res.status(400).send(user.errors[0]);
	}else{
		next();
	}
}

let transporter = nodemailer.createTransport({
	// 사용하고자 하는 서비스, gmail계정으로 전송할 예정이기에 'gmail'
	service: 'Naver',
	// host를 gmail로 설정
	host: 'smtp.naver.com',
	port: 587,
	secure: false,
	auth: {
	  // Gmail 주소 입력, 'testmail@gmail.com'
	  user: smtp_config.user,
	  // Gmail 패스워드 입력
	  pass: smtp_config.password,
	},
});

let signJWT = function(userPhone){
	return new Promise((resolve, reject) => {
		var current_time = moment().unix()
		jwt.sign({
			    userPhone: userPhone,
			    iat : current_time
			}, 
			secret_key, 
			{
	            expiresIn: '3m',
	            issuer: 'amugong',
	            subject: 'phone_verification',
	        }, 
			function(err, token) {
				if(err) {reject(err); return;};
			  	//console.log(token);
			  	//여기서 Iat을 DB에 꽂아주기! 
			  	resolve(token)
			}
		)
	})
}


var sendAuthLink = async function(req, res){
	var userPhone = req.body.userID;
	console.log(userPhone);
	console.log(req.headers.host);

	let token = await signJWT(userPhone);

	let link="http://"+req.headers.host+"/api/auth/phone/verify/"+token;
    let html = `<p>전화번호 인증을 위해서 <a href="${link}">LINK</a> 이 링크를 클릭해주세요! 인증 유효기간은 3분입니다!</p> `;

    var sql = 'INSERT INTO TEMPUSER(userPhone) VALUES(?) ON DUPLICATE KEY UPDATE isVerified = 0 ';
	//var sql = 'SELECT * FROM users_customuser';
	db.query(sql ,[userPhone] , async function (error, results, fields) {
		if (error) res.status(500).send("fail");

		////////////////////////////////////////////////
		///////여기서 카카오톡 알림톡 API 로 링크 전송한다////////
		////////////////////////////////////////////////

		try{
			let info = await transporter.sendMail({
			    from: `"Amugong Team" <${smtp_config.user}>`,
			    to: "show981111@gmail.com",
			    subject: 'Amugong 이메일 인증',
			    html: html,
		  	});
			console.log(info);

		}catch(mail_error){
			res.status(500).json({message: mail_error.message})
		}
		res.status(200).send("success");
		
	});
}


var verify_token = function(req, res){
    if(!req.params.token) return res.status(400).json({message: "unable to find a token"});

    jwt.verify(req.params.token, secret_key, function(err, decoded) {
    	if(err) throw err
    	var current_time = moment().unix()
    	var sql = 'UPDATE TEMPUSER SET isVerified = 1, issuedAt = ? WHERE userPhone = ?';
    	db.query(sql ,[current_time, decoded.userPhone] , async function (error, results, fields) {
			if (error) throw error;
					
			//console.log(results);
			res.status(200).send("전화번호 인증이 완료되었습니다! 어플에서 계속해주세요!");
			
		});
		//console.log(decoded) // bar
	});

}

var auto_login = function(req, res){
	if (!req.headers.authorization) {
	    return res.status(403).json({ error: 'No credential' });
	}
	if(!req.headers.authorization.startsWith('Bearer ')) {
		return res.status(403).json({ error: 'No credential' });
	}

	var token = req.headers.authorization;
	token = token.slice(7, token.length).trimLeft();
	
	console.log(token);

    jwt.verify(token, secret_key, function(err, decoded) {
    	if(err){
    		res.status(403).json("Forbidden");
    	}
    	console.log(decoded);
    	var sql = 'SELECT userID, name FROM USER WHERE userID = ? AND issuedAt = ?';
    	db.query(sql ,[decoded.userID, decoded.iat] , async function (error, results, fields) {
			if (error){
				res.status(500).json("error");
			}

			if(results.length > 0){
				res.status(200).json(results);
			}else{
				res.status(404).json({ error: 'Not found' });
			}			
		});
	});

}




module.exports = {
	checkPhoneInput : checkPhoneInput,
	sendAuthLink : sendAuthLink,
	verify_token : verify_token,
	auto_login : auto_login
};