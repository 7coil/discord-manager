//Include Discord
var client = new Discord.Client();

if (getGET("token")) {
	//Login to Discord
	client.login(getGET("token"))
		.catch(function(error) {
			error = encodeURIComponent(error);
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
	loadSliders();
	getGuilds();
	getBasic();
});

//Make a HTML array to store all the relevant HTML elements.
var html = [];

//Find the following IDs in the document
var parts = [
	"guilds",
	"usercount",
	"botcount",
	"totalcount",
	"guildcount",
	"botminimum",
	"botpercentage",
	"botpurgereally"
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
		var botcount = element.members.filter(guildMember => guildMember.user.bot).size;

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
			icon.setAttribute("src", `https://cdn.discordapp.com/icons/${element.id}/${element.icon}.png`)
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

		//Add a button to purge the guild
		var buddon1 = document.createElement("a");
		buddon1.setAttribute("class", "waves-effect waves-light btn");
		buddon1.setAttribute("onclick", `removeGuild(${element.id});`);
		body.appendChild(buddon1);

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

function purge() {
	bots = html["botminimum"].noUiSlider.get();
	fraction = html["botpercentage"].noUiSlider.get()/100;
	percentage = html["botpercentage"].noUiSlider.get() + "%";

	client.guilds.forEach(function(element) {
		console.log("Scanning " + element.name);
    	console.dir(element);

		var botcount = element.members.filter(guildMember => guildMember.user.bot).size;

		if (((botcount/element.members.size) > fraction) && botcount > bots) {
			if(html["botpurgereally"].checked) {
				Materialize.toast('Left server "' + element.name + '" with ' + ((botcount/element.members.size)*100).toFixed(2) + "% bots", 4000);

				let embed = new Discord.RichEmbed()
					.setDescription("Your server '" + element.name + "' has been identified as a bot collection server. As a result, this bot has automatically left your server.")
					.addField("Set Values", "More than " + bots + " bots with " + percentage + " of users as bots.", true)
					.addField("Your Values", botcount + " bots with " + ((botcount/element.members.size)*100).toFixed(2) + "% of users as bots.", true)
					.setFooter("DiscordManager by moustacheminer.com");

				element.owner.user.sendEmbed(embed, "");

				element.leave();

				var li = document.getElementById(element.id);
				li.innerHTML = "";
				delete li;
			} else {
				Materialize.toast(element.name + '" with ' + ((botcount/element.members.size)*100).toFixed(2) + "% bots will be purged.", 4000);
			}
		}
	});

	if(html["botpurgereally"].checked) {
		Materialize.toast('Finished purge.', 4000);
	} else {
		Materialize.toast('Pre-purge analysis finished', 4000);
	}

}

function removeGuild(guildid) {
	let guild = client.guilds.get(guildid);
	Materialize.toast(`Left ${guild.name}`, 4000);

	let embed = new Discord.RichEmbed()
		.setDescription("This bot has been removed from " + guild.name)
		.setFooter("DiscordManager by moustacheminer.com");

	var li = document.getElementById(element.id);
	li.innerHTML = "";
	delete li;

	element.owner.user.sendEmbed(embed, "");

	guild.leave();
}

function getGET(name){
	if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search)) {
		return decodeURIComponent(name[1]);
	}
}

function getBasic() {
	var botcount = client.users.filter(guildMember => guildMember.bot).size;
	var usercount = client.users.size - botcount;

	html["usercount"].innerHTML = "Users: " + usercount;
	html["botcount"].innerHTML = "Bots: " + botcount;
	html["totalcount"].innerHTML = "Total: " + client.users.size;
	html["guildcount"].innerHTML = "Guilds: " + client.guilds.size;
}

function loadSliders() {
	noUiSlider.create(html["botminimum"], {
		start: [20],
		connect: true,
		step: 1,
		range: {
			'min': 0,
			'max': 100
		},
		format: wNumb({
			decimals: 0
		})
	});

	noUiSlider.create(html["botpercentage"], {
		start: [40],
		connect: true,
		step: 5,
		range: {
			'min': 5,
			'max': 100
		},
		format: wNumb({
			decimals: 0
		})
	});
}
