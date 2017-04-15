//Get the websocket URL. This is the root of the webserver.
var url = location.protocol + "//" + location.host;

//Connect to the websocket
var socket = io.connect(url);

//Make a HTML array to store all the relevant HTML elements.
var html = [];

//Find the following IDs in the document
var elements = [
	"guilds"
];

//Find every relevant element that needs to be used.
elements.forEach(function(element) {
	html[element] = document.getElementById(element);
});

//Load the guilds list
socket.emit("guilds");

var messages = document.getElementById("bkmmessages");

socket.on("guilds", function(data) {
	if (data.error) return false;

	guilds = JSON.parse(data.message);
	console.log(data.message);

	guilds.forEach(function(element) {
		//Create the new accordian
		var li = document.createElement("li");

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
		body1.appendChild(document.createTextNode("Member count: " + element.members));
		body1.appendChild(br.cloneNode(true));
		body1.appendChild(document.createTextNode("Bots: " + element.bots));
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

});

socket.on("notify", function(data){
	console.log(data.message);
	Materialize.toast(data.message, 4000);
});
