const jwt = require('jsonwebtoken');
const express = require('express')
const app = express();
const jwt_config  = require('../config/db-jwt-config.json');

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
	
	console.log(token);

    jwt.verify(token, secret_key, function(err, decoded) {
    	if(err){
    		res.status(403).json({ error: err});
    		return;
    	}
    	next();
	});

}

module.exports = check_jwt;