var socket = io.connect('https://node-comicreader.herokuapp.com/home');

socket.on('connect', function () {
	console.log('Connection established');
});

socket.on('refreshClients', function (room, clientsCount) {
	var span = document.getElementById(room);
	span.innerHTML = '(' + clientsCount + ')';
});

socket.on('deleteRoom', function (room) {
	var span = document.getElementById(room);
	span.innerHTML = '';
});

socket.on('disconnect', function () {

});