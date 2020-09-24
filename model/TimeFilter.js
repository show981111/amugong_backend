const moment = require('moment');


const TimeFilter =function (data) {
	this.data = data;
	this.errors = [];
}

TimeFilter.prototype.validateUserInput = function(){

    if("start" in this.data && "end" in this.data && "branchID" in this.data)
	{
		var momentStart = moment(this.data.start , 'YYYY-MM-DD HH:mm', true);
		var momentEnd = moment(this.data.end , 'YYYY-MM-DD HH:mm', true);
		
		if(moment(momentStart, 'YYYY-MM-DD HH:mm').isValid() && moment(momentEnd, 'YYYY-MM-DD HH:mm').isValid()){
			
		}else{
			this.errors.push("time is not valid");
		}
		
	}else{
		this.errors.push("not enough data");
	}
}

TimeFilter.prototype.validateReservationInput = function(){
    const emailRegexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const digitRegexp = /^\d+$/;

    if("startTime" in this.data && "endTime" in this.data && "seatID" in this.data && "userID" in this.data)
	{
		var momentStart = moment(this.data.startTime , 'YYYY-MM-DD HH:mm', true);
		var momentEnd = moment(this.data.startTime , 'YYYY-MM-DD HH:mm', true);

		if(moment(momentStart, 'YYYY-MM-DD HH:mm').isValid() && moment(momentEnd, 'YYYY-MM-DD HH:mm').isValid()){
			if(emailRegexp.test(this.data.userID)){
				if(digitRegexp.test(this.data.seatID)){

				}else{
					this.errors.push("seatID is not number");
				}
			}else{
				this.errors.push("ID is not email");
			}
		}else{
			this.errors.push("time is not valid");
		}
	}else{
		this.errors.push("not enough data");
	}
}

module.exports = TimeFilter;