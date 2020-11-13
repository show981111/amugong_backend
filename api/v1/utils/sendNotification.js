var admin = require("firebase-admin");

var serviceAccount = require("../config/amugong-62c70-firebase-adminsdk-fq29b-c1f5466285.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://amugong-62c70.firebaseio.com"
});

let sendMessageToDevice = function(token, title, message){
	var payload = {
		notification : {
			title : title,
			body : message
		}
	};

	admin.messaging().sendToDevice(token, payload)
	.catch(function(err){
		console.log(err);
	})
	.then(function(response){
		console.log(response);
	});
}

module.exports = sendMessageToDevice;