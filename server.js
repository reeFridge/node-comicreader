var http = require('http');
var server = http.createServer(handler);
var url = require('url');
var fs = require('fs');
var jade = require('jade');

//Static files
var load = fs.readFileSync('./load.gif');
var clientScript = fs.readFileSync('./index.js');
var homeScript = fs.readFileSync('./home.js');
var ico = fs.readFileSync('./favicon.ico');
var Arch = require('./rar');
var arch = new Arch({ findPath: './archives/' });
var io = require('./socket');
//Buffer stream
var BuffStream = require('./buffStream');

module.exports = server;

function handler(req, res) {
	if(req.url == '/favicon.ico') {
		res.statusCode = 200;
		res.writeHead('Content-Type', 'image/png');
		res.writeHead('Content-Length', ico.length);
		res.end(ico);
		return;
	}

	if(req.url == '/load.gif') {
		res.statusCode = 200;
		res.writeHead('Content-Type', 'image/gif');
		res.writeHead('Content-Length', load.length);
		res.end(load);
		return;
	}

	if(req.url == '/client/index.js') {
		res.statusCode = 200;
		res.writeHead('Content-Type', 'text/javascript');
		res.writeHead('Content-Length', clientScript.length);
		res.end(clientScript);
		return;
	}

	if(req.url == '/client/home.js') {
		res.statusCode = 200;
		res.writeHead('Content-Type', 'text/javascript');
		res.writeHead('Content-Length', homeScript.length);
		res.end(homeScript);
		return;
	}

	/*if(req.url == '/home') {
	res.writeHead('Content-Type', 'text/html');
	res.statusCode = 200;
	fs.readdir('./archives', function (err, files) {
		if (err){ 
			console.error(err);
			res.end('<p>Something was wrong</p><br />' + err);
		} else {
			for (var n in files) {
				files[n] = files[n].split('.')[0];
			}
			res.end(jade.renderFile('./views/main.jade', { files : files }));
		}
	});
	return;
	}*/

	//Request on page cache
	var parsedUrl = url.parse(req.url);
	var s = parsedUrl.path.slice(1).split('/');
	var book = s[0];
	var page = s[1];

	if(page) {
		var arc = arch.findByName(book);
		if (arc) {
			sendPage(page, arc, res);
			return;
		} else {
			res.end('Book not found');
			return;
		}
	}

	if (book) {
		res.statusCode = 200;
		res.writeHead('Content-Type', 'text/html');
		res.end(jade.renderFile('./views/index.jade', { title: book }));
		arc = arch.findByName(book);
		if (!arc) 
			arch.open(book, function (rf) {
				return;				
			});
	}

	//Response on all another request
	/*res.writeHead('Content-Type', 'text/html');
	res.writeHead(301, {Location: '/home'});
	res.end();*/
	res.statusCode = 200;
	res.writeHead('Content-Type', 'text/html');
	fs.readdir('./archives', function (err, files) {
		if (err){ 
			console.error(err);
			res.end('<p>Something was wrong</p><br />' + err);
		} else {
			for (var n in files) {
				files[n] = files[n].split('.')[0];
			}
			res.end(jade.renderFile('./views/main.jade', { files : files }));
		}
	});
}

function sendPage(page, arc, res) {

	if(arc.names[page] || arc.cache[page]){
		res.writeHead('Content-Type', 'image/jpg');	
		res.statusCode = 200;

		if (!arc.cache[page]) {
			arc.pipe(arc.names[page], res);
			arch.cachePage(arc, page, function (err, cache) {
			
				if (err) console.error(err);
			
				console.log('File ' + arc.names[page] + ' completely cahced');
				console.log(cache);
			});
		} else {
			var buffStream = new BuffStream(arc.cache[page].buff);
			buffStream.pipe(res);
		}

	} else {
		res.writeHead('Content-Type', 'text/plain');
		res.statusCode = 404;
		res.end('Sorry but this page not found!\n(404)');
	}
}