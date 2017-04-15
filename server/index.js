//Include everything for socket.io and for the webserver
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

//Include path for relative folders
var path = require('path');

//Include Discord
var Discord = require('discord.js');
var client = new Discord.Client();

//Include configs and APIs
var config = require('config.json');
var api = require('api.json');

//Select the "client" folder for the webserver to use as root
app.use(express.static(path.join(__dirname, '../client/')));

//Wait until the client is ready
client.on('ready', function() {
	console.log("Successfully connected to Discord!");



	//Start checking for connections when the client has started.
	io.on('connection', function (socket) {
		socket.on("user", function (data) {

		});
		socket.on("message", function (data) {

		});
	});

});

server.listen(process.env.PORT || 8080);


client.on('message', function(message) {

});
