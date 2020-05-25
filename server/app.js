// module declaration
const express = require('express');
const app = express();
const cors = require('cors');
const cookie_parser = require('cookie-parser');
const bodyParser = require('body-parser');

// DB connection
const models = require("./models/index.js");

models.sequelize.sync().then( () => {
  console.log(" DB connect");
}).catch(err => {
  console.log(" DB connect fail");
  console.log(err);
});

// 서버 구동
const fs = require('fs');
const http = require('http');
const https = require('https');

// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/server.anicro.org/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/server.anicro.org/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/server.anicro.org/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

// Starting both http & https servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(80, () => {
	console.log('HTTP Server running on port 80');
});

httpsServer.listen(443, () => {
	console.log('HTTPS Server running on port 443');
});

// body-paerser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// use static folder
app.use(express.static('public'));
// cors
app.use(cors());
// cookie-parser
app.use(cookie_parser());

// create socket
const io = require("socket.io")(httpsServer);

const router = express.Router();

// routing
const authRouter = require('./router/r_auth')(router, io);
app.use('/auth', authRouter);

const boardRouter = require('./router/r_board')(router);
app.use('/board', boardRouter);

const chatRouter = require('./router/r_chat')(router);
app.use('/chat', chatRouter);
const socket = require("./utils/u_socket")(io);

const homeRouter = require('./router/r_home')(router);
app.use('/', socket, homeRouter);

var count = 1;
io.on('connection', function(socket){ 
  	console.log('user connected: ', socket.id);  
  	var name = "익명" + count++;                 
	socket.name = name;
  	io.to(socket.id).emit('create name', name);   
	io.emit('new_connect', name);
	
	socket.on('disconnect', function(){ 
	  console.log('user disconnected: '+ socket.id + ' ' + socket.name);
	  io.emit('new_disconnect', socket.name);
	});

	socket.on('chat message', function(name, text){ 
		var msg = name + ' : ' + text;
		if(name != socket.name)
			io.emit('change name', socket.name, name);
		socket.name = name;
    	console.log(msg);
    	io.emit('receive message', msg);
	});
	
});
