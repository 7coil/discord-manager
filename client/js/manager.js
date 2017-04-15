//Include Discord
var client = new Discord.Client();

if (getGET("token")) {
	//Login to Discord
	client.login(getGET("token"))
		.catch(function(error) {
			window.location.href = 'index.html?error=' + error;
		});
} else {
	window.location.href = 'index.html?error=Error:%20Login%20details%20were%20not%20provided.';

	//If the user hasn't gone back in a second, close the window.
	setTimeout(function() {
		close();
	}, 1000);
}


//Wait until the client is ready
client.on('ready', function() {
	console.log("Successfully connected to Discord!");
	getGuilds();
});

//Make a HTML array to store all the relevant HTML elements.
var html = [];

//Find the following IDs in the document
var parts = [
	"guilds"
];

//Find every relevant element that needs to be used.
parts.forEach(function(part) {
	html[part] = document.getElementById(part);
});

function getGuilds() {
	html["guilds"].innerHTML = "";

	client.guilds.forEach(function(element) {
		if (!element.name) return false;

		console.log("Scanning " + element.name);
		var botcount = 0;

		element.members.forEach(function(member){
			if(member.user.bot) {
				botcount++;
			}
		});

		//Create the new accordian element
		var li = document.createElement("li");
		li.setAttribute("id", element.id)

		//Make a newline for later
		var br = document.createElement("br");

		//Create the elements in the accordian, and set the class
		var header = document.createElement("div");
		var body = document.createElement("div");
		header.setAttribute("class", "collapsible-header");
		body.setAttribute("class", "collapsible-body");

		//Add an image, if it exists
		if (element.icon) {
			var icon = document.createElement("img");
			icon.setAttribute("src", "https://cdn.discordapp.com/icons/" + element.id + "/" + element.icon + ".png")
			icon.setAttribute("style", "float: right; background-color: #8B9EDC;")
			body.appendChild(icon);
		}

		//Add a subheading
		var head1 = document.createElement("h5");
		head1.appendChild(document.createTextNode("Basic Info"));
		body.appendChild(head1);

		//Add text to subheading
		var body1 = document.createElement("p");
		body1.appendChild(document.createTextNode("Name: " + element.name));
		body1.appendChild(br.cloneNode(true));
		body1.appendChild(document.createTextNode("Member count: " + element.members.size));
		body1.appendChild(br.cloneNode(true));
		body1.appendChild(document.createTextNode("Bots: " + botcount));
		body1.appendChild(br.cloneNode(true));
		body.appendChild(body1);

		//Set and append to header
		var headertext = document.createTextNode(element.name);
		header.appendChild(headertext);

		//Append header and body to li
		li.appendChild(header);
		li.appendChild(body);

		//Add the element to the accoridan
		html["guilds"].appendChild(li);
	});
	Materialize.toast('Loaded Guilds', 4000);
}

function purge(fraction) {
	client.guilds.forEach(function(element) {
		console.log("Scanning " + element.name);
		var botcount = 0;

		element.members.forEach(function(member){
			if(member.user.bot) {
				botcount++;
			}
		});

		if ((botcount/element.members.size) > fraction) {
			Materialize.toast('Left server "' + element.name + '" with ' + ((botcount/element.members.size)*100).toFixed(2) + "% bots", 4000);
			element.leave();

			var li = document.getElementById(element.id);
			li.innerHTML = "";
			delete li;
		}
	});

	Materialize.toast('Finished purge.', 4000);
}

function getGET(name){
	if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search)) {
		return decodeURIComponent(name[1]);
	}
}
