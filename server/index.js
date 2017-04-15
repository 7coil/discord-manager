//Include configs and APIs
var config = require('./config.json');
var api = require('./api.json');

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

//Login to Discord
client.login(api.discord);

//Select the "client" folder for the webserver to use as root
app.use(express.static(path.join(__dirname, '../client/')));

//Wait until the client is ready
client.on('ready', function() {
	console.log("Successfully connected to Discord!");

	//Start the webserver on the port in the config.json, or if not set, use 8080
	server.listen(config.manager.port || 8080);

	//Start checking for connections when the client has started.
	io.on('connection', function (socket) {

		//If the client wants guilds, we got guilds!
		socket.on("guilds", function() {
			var guilds = client.guilds.array();
			var message = [];

			client.guilds.forEach(function(element){
				var botcount = 0;

				element.members.forEach(function(member){
					if(member.user.bot) {
						botcount++;
					}
				});

				console.log(element.name);

				message.push({
					"name": element.name,
					"id": element.id,
					"icon": element.icon,
					"members": element.memberCount,
					"bots": botcount,
					"owner": element.ownerID
				});
			});

			socket.emit("guilds", {
				error: false,
				message: JSON.stringify(message)
			});
		});



	});

});

process.on("unhandledRejection", function(err) {
  console.error("Uncaught Promise Error: \n" + err.stack);
});
