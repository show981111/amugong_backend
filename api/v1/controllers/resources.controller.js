const express = require('express')
const db = require('../model/db_connection.js')
const bodyParser = require('body-parser')
const app = express()
const moment = require('moment');
var Promise = require('promise');

const AWS = require('aws-sdk');
const s3_config  = require('../config/s3-config.json');
var multer  = require('multer');
const multerS3 = require('multer-s3');


const BUCKET_NAME = s3_config.BUCKET_NAME;
const IAM_USER_KEY = s3_config.IAM_USER_KEY;
const IAM_USER_SECRET = s3_config.IAM_USER_SECRET;


require('moment-timezone'); 
moment.tz.setDefault("Asia/Seoul");

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

AWS.config.update({
    secretAccessKey: IAM_USER_SECRET,
    accessKeyId: IAM_USER_KEY,
    region: 'ap-northeast-2'
});

var s3 = new AWS.S3();

console.log('Resources controller called');

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: BUCKET_NAME,
        key: function (req, file, cb) {
          console.log(req);
            console.log("req body upload ",req.body);
            console.log(file);
            var keyName = file.originalname;
            if(req.body.imageName != null){
              keyName = req.body.imageName;
            }
            cb(null, 'images/'+req.body.branchID+'/'+keyName); //use Date.now() for unique file keys
        }
    })
});

let uploadImage = function(req, res){
  res.status(200).send('suceess');
}


let getImageKeyList = function(req, res){

	var branchID = req.params.branchID;
  console.log(branchID);
  var loacation_params = {
    Bucket: BUCKET_NAME,
    Prefix : 'images/'+branchID
  };
    s3.listObjects(loacation_params, function(err, data) {
      if (err) {
        console.log("Error", err);
        res.send(err.statusCode).send(err);
      } else {
        console.log("Success", data);
        console.log("length", data.Contents.length);

        var keys = [];
        for(var i = 0; i < data.Contents.length; i++){
          console.log(data.Contents[i].Key);
          var splits = data.Contents[i].Key.split('/');
          keys.push(splits[splits.length -1 ])
        }
        
        res.status(200).send(keys);
      }
    });
  
}

let downloadImage = function(req, res){
  var branchID = req.params.branchID;
  var key = req.params.key;
  console.log(req.params);
  var params = {
    Bucket : BUCKET_NAME,
    Key : 'images/' + branchID + '/' + key
  }
  s3.getObject(params, function (err, data) {
      if (err) {
        console.log(err);
        res.status(err.statusCode).send(err);
      } else {
          console.log("Successfully dowloaded data from  bucket");
          console.log(data);
          res.setHeader('Content-disposition', 'attachment: filename='+key);
          // res.set({'Content-Type': 'image/png'});
          res.setHeader('Content-length', data.ContentLength);
          res.end(data.Body);
      }
  });
}



module.exports = {
  upload : upload,
	uploadImage : uploadImage,
	getImageKeyList : getImageKeyList,
  downloadImage : downloadImage
};