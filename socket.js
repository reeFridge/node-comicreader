//Cache object
//var cache = require('./main').cache;

//Socket.io
var io = require('socket.io')();
var roomNsp = io.of('/room');
var homeNsp = io.of('/home');
module.exports = io;

io.rooms = [];

homeNsp.on('connection', function (socket) {
	console.log('Connected ' + socket.id);
});

//Socket.io events
roomNsp.on('connection', function (socket) {
	socket.on('joinRoom', function (room) {
		socket.join(room);
		var Room = getRoom(room) || addRoom(room);
		addClientToRoom(Room, socket.id);
		socket.room = Room;
		io.to(room).emit('who');
		console.log('Client ' + socket.id + ' connected to the room ' + room);
		homeNsp.emit('refreshClients', Room.name, Room.clients.length);
		console.log(io.rooms);
	});
	socket.on('who', function () {
		console.log(socket.id);
	});
	socket.on('loaded', function () {
		console.log('loaded');
	});
	socket.on('disconnect', function () {
		if(deleteClient(socket.room, socket.id)) {
			console.log('Client ' + socket.id + ' closed connection');	
		} else {
			console.log('Client with id ' + socket.id + ' not found in room');
		}
		if(!getClientsCount(socket.room)){
			deleteRoom(socket.room.id);
			homeNsp.emit('deleteRoom', socket.room.name);
		} else {
			homeNsp.emit('refreshClients', socket.room.name, socket.room.clients.length);
		}
		
		console.log(io.rooms);
	});
});

function addRoom(room) {
	var length = io.rooms.push({ name: room, clients: [] });
	io.rooms[length - 1].id = length - 1;
	return io.rooms[length - 1];
}

function getRoom(room) {
	for(var i in io.rooms) {
		if(room == io.rooms[i].name) {
			return io.rooms[i];
		}
	}
	return undefined;
}

function deleteClient(room, clientId) {
	for(var i in room.clients) {
		if(room.clients[i] == clientId) {
			room.clients.splice(i, 1);
			return true;
		}
	}
	return false;
}

function deleteRoom(id) {
	for(var i in io.rooms) {
		if(io.rooms[i].id == id) {
			io.rooms.splice(i, 1);
			return true;
		}
	}
	return false;
}

function addClientToRoom(room, client) {
	try {
		room.clients.push(client);
	} catch(err) {
		console.log('Failed on adding client ' + client + ' in room ' + room.name);
		console.error(err);
	}
}

function getClientsCount(room) {
	return room.clients.length;
}