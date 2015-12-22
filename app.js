//Server object
var server = require('./server');

// var archive = require('./main').archive;

//Socket.io
var io = require('./socket');

//archive.addFile(0, './archives/' + process.argv[2] + '.rar');

//Starting server
server.listen(3000, function (err) {
	if (err) throw err;
	console.log('Server listening on 3000 port');
});

io.listen(server);