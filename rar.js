var rarfile = require('rarfile');
var Writable = require('stream').Writable;

function Arch(opts) {
	this.findPath = opts.findPath || './';
	this.opened = [];
	return this;
}

module.exports = Arch;

Arch.prototype.open = function (file, cb) {
	var that = this;
	try {
		var rf = new rarfile.RarFile(that.findPath + file + '.cbr');
	} catch (err) {
		rf = new rarfile.RarFile(that.findPath + file + '.rar');
	}
	rf.cache = {};
	rf.ready = false;
	var id = that.opened.push({ rf: rf });
	var obj = that.opened[id - 1];
	rf.on('ready', function () {
		console.log('Archive ready');
		obj.rf.names.sort();
		obj.rf.ready = true;
		cb(obj.rf);
	});
};

Arch.prototype.findByName = function (file) {
	var that = this;
	var opened = that.opened;
	for (var n in opened) {
		var name = opened[n].rf.archiveName;  
		if((name == that.findPath + file + '.rar') || (name == that.findPath + file + '.cbr'))
			return opened[n].rf;
	}
	return undefined;
};

Arch.prototype.clean = function (id) {
	var that = this;
	that.opened.splice(id - 1, 1);
};

Arch.prototype.cachePage = function (arc, page, cb) {
	var that = this;
	var buffer = [];
	var rf = arc;
	var ws = newWritableStream(buffer);
	ws.on('finish', function () {
		buffer = Buffer.concat(buffer);
		rf.cache[page] = { buff: buffer };
		cb(null, rf.cache[page]);
	});
	rf.pipe(arc.names[page], ws);
};

function newWritableStream(buffer) {
	var wStream = Writable();
	
	wStream._write = function (chunk, enc, next) {
    	buffer.push(chunk);
    	next();
	};

	return wStream;
}