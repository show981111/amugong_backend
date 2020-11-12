const User =function (data) {
	this.data = data;
	this.errors = [];
}

User.prototype.validateUserInput = function(){
    const phoneRegex = /^\d+$/;

    if("userID" in this.data)
	{
		if(phoneRegex.test(this.data.userID) && this.data.userID.length == 11 && 
			(this.data.userID.substring(0,3) == "010" || this.data.userID.substring(0,3) == "011") ){
		
		}else{
			this.errors.push("ID is not PhoneNumber");
		}
	}else{
		this.errors.push("no ID");
	}
}

User.prototype.validateRegisterInput = function(){
    const phoneRegex = /^\d+$/;
    if("userID" in this.data  && "name" in this.data && "userPassword" in this.data && "token" in this.data){
		if(phoneRegex.test(this.data.userID) && this.data.userID.length == 11){
			
		}else{
			this.errors.push("ID is not PhoneNumber");
		}
	}else{
		this.errors.push("data is not enough");
	}
}


module.exports = User;