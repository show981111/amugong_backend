const User =function (data) {
	this.data = data;
	this.errors = [];
}

User.prototype.validateUserInput = function(){
    const emailRegexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if("userID" in this.data)
	{
		if(emailRegexp.test(this.data.userID)){
		
		}else{
			this.errors.push("ID is not email");
		}
	}else{
		this.errors.push("no ID");
	}
}

User.prototype.validateRegisterInput = function(){
    const emailRegexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if("userID" in this.data  && "name" in this.data && "userPassword" in this.data){
		if(emailRegexp.test(this.data.userID)){
			
		}else{
			this.errors.push("ID is not email");
		}
	}else{
		this.errors.push("data is not enough");
	}
}


module.exports = User;