var mysql      = require('mysql');
const db_config  = require('../config/db-jwt-config.json');

var db = mysql.createConnection({
  host     : db_config.host,
  user     : db_config.user,
  password : db_config.password,
  database : db_config.database
});
 
//db.connect();
if(!db._connectCalled ) 
{
	console.log('db coneccted');
	db.connect();
}

// connection.query('SELECT * FROM users_customuser', function (error, results, fields) {
//   if (error) throw error;
//   console.log(results);
// });
 
// connection.end();

module.exports = db;