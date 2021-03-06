var express = require('express');
const app = express();

var morgan = require('morgan'); //display req in terminal ..
app.use(morgan('dev'));

//APIs request , if needed
var request = require('request'); 

//read req body data 
var bodyParser = require('body-parser');  
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//passwords in/de-crypting ..
//import bcrypt = require('bcrypt'; 

//for log-in/out sessions
var session = require('express-session'); 
app.use(session({
    secret: "ptb",
    resave: true,
    saveUninitialized: true
}));

//for sessions
var cookieParser = require('cookie-parser'); 
app.use(cookieParser());

// Add headers
app.use(function (req, res, next) {

   // Website you wish to allow to connect
   res.setHeader('Access-Control-Allow-Origin', '*');

   // Request methods you wish to allow
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

   // Request headers you wish to allow
   res.setHeader('Access-Control-Allow-Headers', '*');

   // Set to true if you need the website to include cookies in the requests sent
   // to the API (e.g. in case you use sessions)
   res.setHeader('Access-Control-Allow-Credentials', true);

   // Pass to next layer of middleware
   next();
});

/***************************************************
main page 
**************************************************/

app.get('/', (req, res) => {
  res.send('i have nothing to the main page ammar !!!');
})

/************************************************/
/*************    users router  *****************/
/*************     from here    *****************/
/************************************************/

var usersRouter = require('./usersRoute.js');
app.get('/users', (req, res) => {
  usersRouter['get']['/'](req, res, (done, users) => {
    res.status(done ? ((users.length) ? 302 : 404 ) : 500);
    //302 : found , 404 : not found, 500 : intrnal server error
    res.send(users);
  });
})
app.get('/users/signout', (req, res) => {
  console.log('signing out for : ', req.session.username)
  if (req.session.username) {
    usersRouter['get']['/signout'](req, res, (done) => {
      res.status(done ? 202 : 501); 
      //202 : accepted , 501 : internal server error => not implemented
      res.send({"done" : done});
    });
  } else {
    res.status(400);
    //400 : bad request ... there is no session to destoy
    res.send({"done" : false});
  }
});
app.get('/users/userinfo', (req, res) => {
  if (!req.session.username) {
    res.status(401);//401 : not authrised
    return res.send({"found" : false , "message" : "not signed in"});
  } 
  usersRouter['get']['/userinfo'](req, res, (data) => {
    res.send(data);
  });
});

app.get('/users/deleteuser', (req, res) => {
  usersRouter['get']['/deleteuser'](req, res, (done, err) => {
    res.status(done ? 202 : 500); //202 : accepted , 500 :server err
    res.send(done ? {"done" : done} : {"error" : error});
  })
});

app.post('/users/signin', (req, res) => {
  if (!!req.session.username) {
    res.status(400); //401 : un authrized ...
    console.log('already signed in for : ' + req.session.username);
    return res.send({"message" : "already signed in"})
  }
  usersRouter['post']['/signin'](req, res, (info) => {
    //create the session here ....
    if (!!info.username) {
      console.log(`signing in for : ${info.username}`);
      req.session.username = info.username;
      req.session.password = info.password;
      req.session.userid = info.id;
      req.session.type = "user";
      console.log('session : ', req.session);
    }
    res.send(info);
  });
});
app.post('/users/signup', (req, res) => {
  console.log('inside server .. redirecting to ordered route ..');
  usersRouter['post']['/signup'](req, res, (done, message, missing) => {
    res.status(done ? 201 : 400);
    //201 : created , 400 : bad request
    var obj = {message : message}
    obj.saved = done ;
    obj.missing = missing;
    res.send(obj);
  });
});
app.post('/users/deleteuser', (req, res) => {
  usersRouter['post']['/deleteuser'](req, res, (done, err) => {
    res.status(done ? 202 : 500); //202 : accepted , 500 :server err
    res.send(done ? {"done" : done} : {"error" : err});
  })
})

app.post('/users/userbyid', (req, res) => {
  if (!req.body.user_id) {
    res.status(400);
    console.log('find user for the id : ');
    console.log(req.body);
    return res.send({"error" : "send user_id please"});
  }
  usersRouter['post']['/userbyid'](req, res, (done, data) => {
    console.log(data)
    return !done ? res.send({"error" : data}) : res.send({"user" : data});
  })
})

/***************************************************

orgs router from here

**************************************************/


var orgsRouter = require('./orgsRoute.js');
app.get('/orgs', (req, res) => {
  orgsRouter['get']['/'](req, res, (done, orgs) => {
    res.status(done ? ((orgs.length) ? 302 : 404 ) : 500);
    //302 : found , 404 : not found, 500 : intrnal server error
    res.send(orgs);
  });
})
app.get('/orgs/signout', (req, res) => {
  console.log('signing out for : ', req.session.username)
  if (req.session.username) {
    orgsRouter['get']['/signout'](req, res, (done) => {
      res.status(done ? 202 : 501); 
      //202 : accepted , 501 : internal server error => not implemented
      res.send({"done" : done});
    });
  } else {
    res.status(400);
    //400 : bad request ... there is no session to destoy
    res.send({"done" : false});
  }
});

app.get('/orgs/orginfo', (req, res) => {
  if (!req.session.username) {
    res.status(400);//400 : bad request
    return res.send({"found" : false , "message" : "not signed in"});
  } 
  orgsRouter['get']['/orginfo'](req, res, (done, org) => {
          if (done) {
            res.status(302); //302 : found
            res.send({"found" : true , "org" : org});
          } else {
            res.status(404); //404 : not found
            res.send({"found" : false , "message" : "not found"})
          }
          res.status(500); //500 : internal server error
          res.send({"found" : false , "message" : "server error"});
      });
});

app.get('/orgs/deleteorg', (req, res) => {
  orgsRouter['get']['/deleteorg'](req, res, (done, err) => {
    res.status(done ? 202 : 500); //202 : accepted , 500 :server err
    res.send(done ? {"done" : done} : {"error" : error});
  })
});

app.post('/orgs/signin', (req, res) => {
  if (!!req.session.name) {
    res.status(400); //401 : un authrized ...
    console.log('already signed in for : ' + req.session.name);
    return res.send({"message" : "already signed in"})
  }
  orgsRouter['post']['/signin'](req, res, (info) => {
    //create the session here ....
    console.log(`signing in for : ${info.name}`);
    if (!!info.name) {
      req.session.name = info.name;
      req.session.password = info.password;
      req.session.orgid = info.id;
      req.session.type = "org";
      console.log('session : ', req.session);
    }
    res.send(info);
  });
});

app.post('/orgs/signup', (req, res) => {
  orgsRouter['post']['/signup'](req, res, (done, message, missing) => {
    res.status(done ? 201 : 400);
    //201 : created , 400 : bad request
    var obj = {message : message}
    obj.saved = done ;
    obj.missing = missing;
    res.send(obj);
  });
});
app.post('/orgs/deleteorg', (req, res) => {
  orgsRouter['post']['/deleteorg'](req, res, (done, err) => {
    res.status(done ? 202 : 500); //202 : accepted , 500 :server err
    res.send(done ? {"done" : done} : {"error" : err});
  })
});
app.post('/orgs/orgbyid', (req, res) => {
  if (!req.body.org_id) {
    res.status(400);
    console.log('find org for the id : ');
    console.log(req.body);
    return res.send({"error" : "send org_id please"});
  }
  orgsRouter['post']['/orgbyid'](req, res, (done, data) => {
    console.log(data)
    return !done ? res.send({"error" : data}) : res.send({"org" : data});
  })
})


/***************************************************

events router from here

**************************************************/

var eventsRouter = require('./eventsRoute.js');

app.get('/events', (req, res) => {
  eventsRouter['get']['/'](req, res, (done, events) => {
    res.status(done ? ((events.length) ? 302 : 404 ) : 500);
    if (done) console.log('found : ' + events.length + ' events !!!!');
    //302 : found , 404 : not found, 500 : intrnal server error
    res.send(events);
  });
});

app.get('/events/orgevents', (req, res) => {
  var re = {};
  if (!req.session.name) {
    res.status(400);
    re.found = false;
    re.message = "sign in first";
    return res.send(re);
  } 
  eventsRouter['get']['/orgevents'](req, res, (done, events, m) => {
    res.status(done ? ((events.length) ? 302 : 404 ) : 500);
    //302 : found , 404 : not found, 500 : intrnal server error
    re = (events.length) ? { events : events} : {message : m}; 
    res.send(re);
  });
});

app.get('/events/userevents', (req, res) => {
  var re = {};
  if (!req.session.username) {
    res.status(400);
    re.found = false;
    re.message = "sign in first";
    return res.send(re);
  } 
  eventsRouter['get']['/userevents'](req, res, (done, events , m) => {
    res.status(done ? ((events.length) ? 302 : 404 ) : 500);
    //302 : found , 404 : not found, 500 : intrnal server error
    done ? re.events = events : re.message = m ; 
    console.log(re);
    res.send(re);
  });
});

app.post('/events/create', (req, res) => {
  if (!req.session || (req.session && req.session.type !== "org")) {
    res.status(401); //401 : un authrized ...
    console.log('un authrized user to create event .....');
    return res.send({message : "sign in as organisation first !!"})
  }
  eventsRouter['post']['/create'](req, res, (done, message) => {
    res.status(done ? 201 : 400);
    res.send({"message" : message});
  });
});

app.post('/events/deleteevent', (req, res) => {
  if (!req.session || (req.session && req.session.type !== "org")) {
    res.status(401); //401 : un authrized ...
    console.log('un authrized user to create event .....');
    return res.send({message : "sign in as organisation first !!"})
  }
  eventsRouter['post']['/deleteevent'](req, res, (done, message) => {
    res.status(done ? 201 : 400);
    res.send({"done" : done , "message" : message});
  });
});

app.post('/events/join', (req, res) => {
  if (!req.session.username) {
    res.status(401); //401 : un authrized ...
    console.log('un authrized user to join event .....', req.session);
    return res.send({message : "sign in as user first !!"})
  }
  eventsRouter['post']['/join'](req, res, (done, message) => {
    res.send({"done" : done , "message" : message});
  });
});


/***************************************************

server 

**************************************************/
app.post('/admin/deleteEvent', (req, res) => {
  eventsRouter['admin']['/deleteEvent'](req, res, (done, message) => {
    res.send({"done" : done , "message" : message});
  });
});

app.post('/admin/createEvent', (req, res) => {
  eventsRouter['admin']['/createEvent'](req, res, (done, message) => {
    res.status(done ? 201 : 400); //400 : bad req , 201 : created
    res.send({"message" : message});
  });
});

var port = process.env.PORT || 3336
var listener = app.listen(port , () => {
	const { address, port } = listener.address();
	console.log(`listining on http://${address}:${port}`);
});


module.exports = app;