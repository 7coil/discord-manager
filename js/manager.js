// Make a HTML array to store all the relevant HTML elements.
const html = [];

// Find the following IDs in the document
const parts = [
	'stats',
	'guilds',
	'modal',
	'percentagebots',
	'minimumusers'
];

// Find every relevant element that needs to be used.
parts.forEach((part) => {
	html[part] = document.getElementById(part);
});

function get(name) {
	const regex = new RegExp(`[?&]${encodeURIComponent(name)}=([^&]*)`);
	const output = regex.exec(location.search);
	if (output && output[1]) return decodeURIComponent(output[1]);
	return false;
}
function botStats(bot) {
	return {
		users: bot.users.filter(guildMember => !guildMember.bot).size,
		bots: bot.users.filter(guildMember => guildMember.bot).size,
		total: bot.users.size,
		guilds: bot.guilds.size
	};
}
function guildsStats(bot) {
	return {
		guilds: bot.guilds.map(guild => ({
			name: guild.name,
			id: guild.id,
			users: guild.members.filter(guildMember => !guildMember.user.bot).size,
			bots: guild.members.filter(guildMember => guildMember.user.bot).size,
			total: guild.members.size,
			percentage: Math.floor((guild.members.filter(guildMember => guildMember.user.bot).size / guild.members.size) * 100)
		})).sort((a, b) =>
			b.percentage - a.percentage
		)
	};
}
function guildStats(bot, guildid) {
	const guild = bot.guilds.get(guildid);
	return {
		name: guild.name,
		id: guild.id,
		users: guild.members.filter(guildMember => !guildMember.user.bot).size,
		bots: guild.members.filter(guildMember => guildMember.user.bot).size,
		total: guild.members.size,
		percentage: Math.floor((guild.members.filter(guildMember => guildMember.user.bot).size / guild.members.size) * 100)
	};
}
function renderBotStats(bot) {
	html.stats.innerHTML = Mustache.render(`
			<span>Users: {{ users }}</span><br>
			<span>Bots: {{ bots }}</span><br>
			<span>Total: {{ total }}</span><br>
			<span>Guilds: {{ guilds }}</span><br>
		`, botStats(bot));
}
function renderGuildsStats(bot) {
	html.guilds.innerHTML = Mustache.render(`
			{{ #guilds }}
			<li>
				<div class="collapsible-header">{{ name }}</div>
				<div class="collapsible-body">
					<span>ID: {{ id }}</span><br>
					<span>Users: {{ users }}</span><br>
					<span>Bots: {{ bots }}</span><br>
					<span>Total: {{ total }}</span><br>
					<span>Percentage of bots: {{ percentage }}%</span><br>
					<a class="waves-effect waves-light btn red" onclick="removeGuild(client, '{{ id }}')">Leave</a>
					<a class="waves-effect waves-light btn" onclick="messageModal(client, '{{ id }}')">Message</a>
				</div>
			</li>
			{{ /guilds }}
		`, guildsStats(bot));
}
function removeGuild(bot, guildid) { // eslint-disable-line no-unused-vars
	bot.guilds.get(guildid).leave()
		.then((g) => {
			renderBotStats(bot);
			renderGuildsStats(bot);
			Materialize.toast(`Left ${g.name}`, 4000);
		});
}
function removeModal(bot, minimum, percentage) { // eslint-disable-line no-unused-vars
	const info = {
		guilds: guildsStats(bot).guilds.filter(guild => guild.total > minimum && guild.percentage > percentage),
		count: guildsStats(bot).guilds.filter(guild => guild.total > minimum && guild.percentage > percentage).length,
		minimum,
		percentage
	};

	if (info.count) {
		html.modal.innerHTML = Mustache.render(`
			<div class="modal-content">
				<h4>Prune guilds with more than {{ percentage }}% bots and at least {{ minimum }} total accounts</h4>
				<p>This action will get rid of the following {{ count }} guilds.</p>
				<ul>
					{{ #guilds }}
					<li>{{ name }} with {{ percentage }}% bots.</li>
					{{ /guilds }}
				</ul>
			</div>
			<div class="modal-footer">
				<a class="modal-action modal-close waves-effect waves-light btn-flat">Cancel</a>
				<a class="modal-action modal-close waves-effect waves-light btn-flat red" onclick="pruneBots(client, {{ minimum }}, {{ percentage }})">Throw the b1nzy hammer</a>
			</div>
		`, info);
		$('#modal').modal('open');
	} else {
		Materialize.toast('No guilds fit the criteria.', 4000);
	}
}
function messageModal(bot, guildid) { // eslint-disable-line no-unused-vars
	if (!bot.guilds.get(guildid).owner) {
		Materialize.toast('This guild doesn\'t have an owner', 4000);
	} else {
		html.modal.innerHTML = Mustache.render(`
			<div class="modal-content">
				<h4>Send message to {{ name }}</h4>
				<div class="input-field col s12">
					<textarea id="message" class="materialize-textarea"></textarea>
					<label for="message">Message</label>
				</div>
			</div>
			<div class="modal-footer">
				<a class="modal-action modal-close waves-effect waves-light btn-flat">Cancel</a>
				<a class="modal-action modal-close waves-effect waves-green btn-flat" onclick="messageOwner(client, '{{ id }}', document.getElementById('message').value)">Owner</a>
				<a class="modal-action modal-close waves-effect waves-green btn-flat" onclick="messageGeneral(client, '{{ id }}', document.getElementById('message').value)">General</a>
			</div>
		`, guildStats(bot, guildid));
		$('#modal').modal('open');
	}
}
function messageOwner(bot, guildid, text) { // eslint-disable-line no-unused-vars
	if (!bot.guilds.get(guildid).owner) {
		Materialize.toast('This guild doesn\'t have an owner', 4000);
	} else {
		bot.guilds.get(guildid).owner.createDM().then((dm) => {
			dm.send(text)
				.then(() => {
					Materialize.toast('Sent message', 4000);
				})
				.catch((err) => {
					Materialize.toast(`Error in sending message: ${err.message}`, 4000);
				});
		});
	}
}
function messageGeneral(bot, guildid, text) { // eslint-disable-line no-unused-vars
	bot.guilds.get(guildid).defaultChannel.send(text)
		.then(() => {
			Materialize.toast('Sent message.', 4000);
		})
		.catch((err) => {
			Materialize.toast(`Error in sending message: ${err.message}`, 4000);
		});
}
function pruneBots(bot, minimum, percentage) { // eslint-disable-line no-unused-vars
	guildsStats(bot).guilds.filter(guild => guild.total > minimum && guild.percentage > percentage).forEach((guild) => {
		removeGuild(bot, guild.id);
	});
}

// Include Discord
const client = new Discord.Client();
if (!get('token')) window.location.href = 'index.html?error=Error:%20Login%20details%20were%20not%20provided.';

client.login(get('token'))
	.catch((error) => {
		window.location.href = `index.html?error=${encodeURIComponent(error)}`;
	});

// Wait until the client is ready
client.on('ready', () => {
	Materialize.toast('Successfully connected to Discord!', 4000);
	renderBotStats(client);
	renderGuildsStats(client);
});
