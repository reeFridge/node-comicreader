//Server object
var server = require('./server');

// var archive = require('./main').archive;

//Socket.io
var io = require('./socket');

//archive.addFile(0, './archives/' + process.argv[2] + '.rar');
var port = process.env.PORT || 5000;
//Starting server
server.listen(port, function (err) {
	if (err) throw err;
	console.log('Server listening on ' + port);
});

io.listen(server);