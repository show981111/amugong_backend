const moment = require('moment');

function formatLocation(username,text, lat, lang) {
	return {
		username,
		text, 
		lat,
		lang,
		time : moment().format('h:mm a')
	}
}

module.exports = formatLocation; 