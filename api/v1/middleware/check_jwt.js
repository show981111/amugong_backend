const jwt = require('jsonwebtoken');
const express = require('express')
const app = express();
const jwt_config  = require('../config/db-jwt-config.json');
const db = require('../model/db_connection.js')

const secret_key = jwt_config.secret_key;


var check_jwt = function(req, res, next){
	if (!req.headers.authorization) {
	    return res.status(403).json({ error: 'No credential' });
	}
	if(!req.headers.authorization.startsWith('Bearer ')) {
		return res.status(403).json({ error: 'No credential' });
	}
	
	var token = req.headers.authorization;
	token = token.slice(7, token.length).trimLeft();
	
    jwt.verify(token, secret_key, function(err, decoded) {
    	if(err){
    		return res.status(403).json({ error: err});
    	}
    	var sql = 'SELECT userID, name FROM USER WHERE userID = ? AND issuedAt = ?';

    	db.query(sql ,[decoded.userID, decoded.iat] , async function (error, results, fields) {
			if (error){
				return res.status(403).json({ error: error});
			}

			if(results.length > 0){
		    	req.token_userID = decoded.userID;
				next();
			}else{
				return res.status(403).json({ error: 'outdated crednetial' });
			}			
		});
    	// console.log(decoded);
    	// req.token_userID = decoded.userID;
    	// next();
	});

}

module.exports = check_jwt;