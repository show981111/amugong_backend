const express = require('express')
const db = require('../model/db_connection.js')
const User = require('../model/user.model.js')
const bodyParser = require('body-parser')
const app = express()
const moment = require('moment');
var fs = require('fs');
const naver_map  = require('../config/naver_map.json');



var Promise = require('promise');


require('moment-timezone'); 
moment.tz.setDefault("Asia/Seoul");

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

console.log('map controller called');

let mapFunction = function(){
	var mapOptions = {
	    center: new naver.maps.LatLng(37.3595704, 127.105399),
	    zoom: 13
	};

	var map = new naver.maps.Map('map', mapOptions);
	console.log("map fuction called ");
}

var showMap = function(req,res){
	var lat = req.params.lat;
	var lang = req.params.lang;
	//console.log(__dirname );

	res.status(200).send(
		`
		<html>
			<head>
			    <meta charset="UTF-8">
			    <meta http-equiv="X-UA-Compatible" content="IE=edge">
			    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
			    <title>간단한 지도 표시하기</title>
			    <script type="text/javascript" src="https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${naver_map.CLIENT_ID}"></script>
			</head>
			<style>
				body {margin: 0;padding: 0;}
			</style>	
			<body>
			<div id="map" style="width:100%;height:100%;"></div>

			<script>
				var mapOptions = {
				    center: new naver.maps.LatLng(${lat}, ${lang}),
				    zoom: 13
				};

				var map = new naver.maps.Map('map', mapOptions);
				Print.postMessage('Hello World being called from Javascript code');
			</script>
			</body>
			</html>
		`
		)
}



module.exports = {
	showMap : showMap
};