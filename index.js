var pBtn = document.getElementById('p');
var nBtn = document.getElementById('n');
var socket = io.connect('http://localhost:3000/room');
var image = document.getElementById('image');
var book = window.location.href.split('/');

socket.on('connect', function () {
	socket.emit('joinRoom', book[book.length - 1]);
	image.setAttribute('src', '/' + book[book.length - 1] + '/0');
});

socket.on('who', function () {
	socket.emit('who');		
});
socket.on('loaded', function () {
	console.log('loaded');
	image.setAttribute('src', '/' + book[book.length - 1] + '/0');
});
pBtn.addEventListener('click', function () {
	var s = image.getAttribute('src').split('/');
	var id = parseInt(s[s.length - 1]);
	image.setAttribute('src', '/' + book[book.length - 1] + '/' + (--id));
});
nBtn.addEventListener('click', function () {
	var s = image.getAttribute('src').split('/');
	var id = parseInt(s[s.length - 1]);
	image.setAttribute('src', '/' + book[book.length - 1] + '/' + (++id));
});