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
const naver_sens_config  = require('../config/naver-sens.json');

const axios = require('axios').default;

const secret_key = jwt_config.secret_key;
const crypto = require('crypto');
var CryptoJS = require('crypto-js');
var SHA256 = require('crypto-js/sha256');
var Base64 = require('crypto-js/enc-base64');

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

let makeAPIsignature = function(){
	const date = Date.now().toString();
	const uri = naver_sens_config.serviceID;
	const secretKey = naver_sens_config.API_secretKey;
	const accessKey = naver_sens_config.API_accessKey;
	const method = 'POST';
	const space = " ";
	const newLine = "\n";
	const url2 = `/sms/v2/services/${uri}/messages`;

	const  hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);

	hmac.update(method);
	hmac.update(space);
	hmac.update(url2);
	hmac.update(newLine);
	hmac.update(date);
	hmac.update(newLine);
	hmac.update(accessKey);

	const hash = hmac.finalize();
	const signature = hash.toString(CryptoJS.enc.Base64);
	return signature;
}


var sendAuthCode = async function(req, res){
	var userPhone = req.body.userID;
	console.log(userPhone);

	let token = await signJWT(userPhone);

	// let link="http://"+req.headers.host+"/api/auth/phone/verify/"+token;
    // let html = `<p>전화번호 인증을 위해서 <a href="${link}">LINK</a> 이 링크를 클릭해주세요! 인증 유효기간은 3분입니다!</p> `;
	var sixdigitsrandom = Math.floor(100000 + Math.random() * 900000);
	var code = crypto.createHash('sha512').update(sixdigitsrandom.toString()).update(secret_key).digest('base64');
	var current_time = moment().unix();
    var sql = 'INSERT INTO TEMPUSER(userPhone, code, issuedAt) VALUES(?, ?, ?) ON DUPLICATE KEY UPDATE isVerified = 0, code = ?, issuedAt =? ';
	//var sql = 'SELECT * FROM users_customuser';
	db.query(sql ,[userPhone, code, current_time, code, current_time] , async function (error, results, fields) {
		if (error) {
			res.status(500).send("fail");
			return;
		}

		////////////////////////////////////////////////
		///////여기서 SMS 인증 한다////////
		////////////////////////////////////////////////

		const headers = {
			'Content-type': 'application/json; charset=utf-8',
			'x-ncp-iam-access-key': naver_sens_config.API_accessKey,
			'x-ncp-apigw-timestamp': Date.now().toString(),
			'x-ncp-apigw-signature-v2': makeAPIsignature()
		}

		var data = {
			'type' : 'SMS',
			'countryCode' : '82',
			'from' : naver_sens_config.phone_number,
			'content' : `[Amugong] 인증번호 [${sixdigitsrandom}]를 입력해주세요!`,
			'messages' : [
				{
					'to' : `${userPhone}`
				}
			]
		}

		const url = `https://sens.apigw.ntruss.com/sms/v2/services/${naver_sens_config.serviceID}/messages`;

		axios.post(url, data, {
		    headers: headers
		  })
		  .then(function (response) {

		  })
		  .catch(function (error) {
		    console.log(error.response.status);
		    res.status(500).send(error);
		    return;
		  });

		//이메일 방식의 인증
		// try{
		// 	let info = await transporter.sendMail({
		// 	    from: `"Amugong Team" <${smtp_config.user}>`,
		// 	    to: "show981111@gmail.com",
		// 	    subject: 'Amugong 이메일 인증',
		// 	    html: html,
		//   	});
		// 	console.log(info);

		// }catch(mail_error){
		// 	res.status(500).json({message: mail_error.message})
		// }
		res.status(200).send("success");
		
	});
}

var verify_code = function(req, res){
	if( req.body.code == null){
		res.status(500).send("not enough data");
		return;
	}

	var code = crypto.createHash('sha512').update(req.body.code).update(secret_key).digest('base64');
	var current_time = moment().unix();
	var sql = 'SELECT issuedAt FROM TEMPUSER WHERE userPhone = ? AND code = ?';
	db.query(sql ,[req.body.userID, code] , async function (error, results, fields) {
		if (error){
			res.status(500).send(error);
			return;
		};
		if(results.length > 0){
			if(current_time - results[0].issuedAt < 180)
			{
				var sql = 'UPDATE TEMPUSER SET isVerified = 1 WHERE userPhone = ? AND code = ?';
		    	db.query(sql ,[req.body.userID, code] , async function (error, results, fields) {
					if (error){
						res.status(500).send(error);
						return;
					};
					console.log(results);
					if(results.affectedRows > 0){
			  			res.status(200).send("success");
			  		}else{
			  			res.status(500).send("error");
			  		}
					//console.log(results);
					
				});
			}else{
				res.status(403).send("time over");
			}
		}else{
			res.status(404).send("incorrect code");
		}
		//console.log(results);		
	});
	//console.log(decoded) // bar


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
	sendAuthCode : sendAuthCode,
	verify_token : verify_token,
	auto_login : auto_login,
	verify_code : verify_code
};