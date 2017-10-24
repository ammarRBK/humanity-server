const Users = require('../database/comp/users.js');

module.exports = {
  get : {
    '/' : (req, res, cb) => {
      Users.findAll()
        .then((users) => {
          console.log('found : ' , users.length , ' users ...');
          cb(true, users);
        })
        .catch((err) => {
          console.log('error getting users : ' , err);
          cb(false, []);
        })
    },
    '/signout' : (req, res, cb) => {
      req.session.destroy((err) => {
        if (err) {
          console.log('error destroying session !! , error message : ' , err.message);
          cb(false);
        } else {
          cb(true);
        }
      })
    },
    '/userinfo' : (req, res, cb) => {
      var userName = req.session.username;
      Users.find({where : {username : userName}})
        .then((user) => {
          if (user){
            res.status(302); //302 : found
            cb({"found" : true , "user" : user});
          } else {
            res.status(404); //404 : not found
            cb({"found" : false , "message" : "not found"})
          }
        })
        .catch((err) => {
          res.status(500); //500 : internal server error
          cb({"found" : false , "message" : "server error"});
        })
    },
    '/deleteuser' : (req, res, cb) => {
      var userName = req.session.username;
      Users.find({where : {username : userName}})
        .then((user) => {
          user.destroy({})
          cb(true);
        })
        .catch((err) => {
          var m = "error erasing because : " + err.message
          console.log(m);
          cb(false, {message: m});
        })
    },
  },
  post : {
    '/signin' : (req, res, cb) => {
      var info = req.body;
      console.log('info to users/signin :  ', info);
      Users.find({where : {username : info.username , password : info.password}})
        .then((user) => {
          if (user.username) {
            console.log('signing in for : ', user.username);
            res.status(202);
            return cb(user);
          }
          res.status(400); //400 : bad request
          cb({});
        })
        .catch((err , user) => {
          res.status(500); //500 : internal server error
          cb({});          
        })
    },
    '/signup' : (req, res, cb) => {
      var user = req.body;
      console.log('info of user to signup : ', user);
      Users.build(user)
        .save()
        .then((data) => {
          var m = "recieved user : " + user.username + " and saved !!";
          console.log(m);
          cb(true , m);
        })
        .catch((err) => {
          var m = "recieved user : " + user.username + " but not saved coz : " ;
          var missing = [];
          if (!user.username) {
            missing.push('name');
          }
          if (!user.email) {
            missing.push('email');
          }
          if (!user.password) {
            missing.push('password');
          }
          console.log('...............................................');
          err.errors.forEach((e) => (m += e.message))
          console.log(m);
          missing && console.log('missing : ' , missing);
          console.log('...............................................');
          cb(false , m, missing);
        })
    },
    '/deleteuser' : (req, res, cb) => {
      var userName = req.body.username;
      Users.find({where : {username : userName}})
        .then((user) => {
          if (!!user) {
            user.destroy({})
            cb(true);
          } else {
            var m = "error erasing because user not found :("
            console.log(m);
            cb(false, {message: m});
          }
        })
        .catch((err) => {
          var m = "error erasing because : " + err.message
          console.log(m);
          cb(false, {message: m});
        })
    },
  }
}