var mongoose = require('mongoose');
var bcrypt   = require('bcrypt');
var jwt      = require('jsonwebtoken'); 
var logObj   = require('logObj');

var userSchema = mongoose.Schema({
	
   userId:   Number,
   userName: String,
   password: String,
   fName:    String,
   lName:    String,
   updated:  Date,
   created:  Date
});

var User = mongoose.model('user', userSchema);

mongoose.connect('mongodb://localhost:27017/users');
//mongoose.connect('mongodb://admin:admin@ds147421.mlab.com:47421/squares');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'db not connected...'));
db.once('open', function callback() {});

var sessionTokens = [];

module.exports = {
  authenticateUser: authenticateUser,
  checkToken: checkToken
};

function checkToken(req, res, next) {

   var userName = req.swagger.params.name.value;
   var token    = req.swagger.params.token.value;
   
   res.json('true' /* token == sessionTokens */ );
}

function authenticateUser(req, res, next) {

   var name  = req.swagger.params.name.value;
   var pword = req.swagger.params.pword.value;
   
   console.log('authenticateUser:' + name);

   User.findOne({'userName':name} , function(err, data) {
      if(err) {
         return next(err);
      }
	     
	  if (data == null) {
         res.json("{'err':'Invalid User'}");
	  }
      else {		 
		 
		 bcrypt.compare(pword, 
   		    data.password, 
		    function(err, match) {
 		       if (match == true) {
		 	      var userToken = {}
                  userToken.userName = data.userName;
                  userToken.token    = jwt.sign({data:name},'secret',{expiresIn: 60 * 60});

				  sessionTokens.push(userToken);

                  console.log(sessionTokens); 

				  var tokenData = {};
				  tokenData.token    = userToken.token;
				  tokenData.userId   = data.userId.toString();
				  tokenData.fullName = data.fName.toString() + " " +
				                       data.lName.toString();
				  
				  res.json(tokenData);
			   }
               else {
                  res.json("{'err':'Invalid Password'}");				   
               }			   
			});
      }	
   });
}
