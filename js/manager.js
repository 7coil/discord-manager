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

const get = (name) => {
	const regex = new RegExp(`[?&]${encodeURIComponent(name)}=([^&]*)`);
	const output = regex.exec(location.search);
	if (output && output[1]) return decodeURIComponent(output[1]);
	return false;
};
const botStats = bot => ({
	users: bot.users.filter(guildMember => !guildMember.bot).size,
	bots: bot.users.filter(guildMember => guildMember.bot).size,
	total: bot.users.size,
	guilds: bot.guilds.size
});
const guildsStats = bot => ({
	guilds: bot.guilds.map(guild => ({
		name: guild.name,
		id: guild.id,
		users: guild.members.filter(guildMember => !guildMember.user.bot).size,
		bots: guild.members.filter(guildMember => guildMember.user.bot).size,
		total: guild.members.size,
		percentage: Math.floor((guild.members.filter(guildMember => guildMember.user.bot).size / guild.members.size) * 100)
	})).sort((a, b) =>
		b.percentage - a.percentage
	) });
const guildStats = (bot, guildid) => {
	const guild = bot.guilds.get(guildid);
	return {
		name: guild.name,
		id: guild.id,
		users: guild.members.filter(guildMember => !guildMember.user.bot).size,
		bots: guild.members.filter(guildMember => guildMember.user.bot).size,
		total: guild.members.size,
		percentage: Math.floor((guild.members.filter(guildMember => guildMember.user.bot).size / guild.members.size) * 100)
	};
};
const renderBotStats = (bot) => {
	html.stats.innerHTML = Mustache.render(`
			<span>Users: {{ users }}</span><br>
			<span>Bots: {{ bots }}</span><br>
			<span>Total: {{ total }}</span><br>
			<span>Guilds: {{ guilds }}</span><br>
		`, botStats(bot));
};
const renderGuildsStats = (bot) => {
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
};
const removeGuild = (bot, guildid) => { // eslint-disable-line no-unused-vars
	bot.guilds.get(guildid).leave()
		.then((g) => {
			renderBotStats(bot);
			renderGuildsStats(bot);
			Materialize.toast(`Left ${g.name}`, 4000);
		});
};
const removeModal = (bot, minimum, percentage) => { // eslint-disable-line no-unused-vars
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
				<p>This action will get rid of the following {{ count }} guild(s).</p>
				<ul>
					{{ #guilds }}
					<li>{{ name }} with {{ percentage }}% bots.</li>
					{{ /guilds }}
				</ul>
			</div>
			<div class="modal-footer">
				<a class="modal-action modal-close waves-effect waves-light btn-flat">Cancel</a>
				<a class="modal-action modal-close waves-effect waves-light btn-flat red" onclick="pruneBots(client, {{ minimum }}, {{ percentage }})">Ban</a>
			</div>
		`, info);
		$('#modal').modal('open');
	} else {
		Materialize.toast('No guilds fit the criteria.', 4000);
	}
};
const messageModal = (bot, guildid) => { // eslint-disable-line no-unused-vars
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
};
const usernameModal = () => { // eslint-disable-line no-unused-vars
	html.modal.innerHTML = `
		<div class="modal-content">
			<h4>Set username</h4>
			<div class="input-field col s12">
				<input id="username" type="text">
				<label for="username">Message</label>
			</div>
		</div>
		<div class="modal-footer">
			<a class="modal-action modal-close waves-effect waves-light btn-flat">Cancel</a>
			<a class="modal-action modal-close waves-effect waves-green btn-flat" onclick="changeUsername(client, document.getElementById('username').value)">Set Username</a>
		</div>
	`;
	$('#modal').modal('open');
};
const avatarModal = () => { // eslint-disable-line no-unused-vars
	html.modal.innerHTML = `
		<div class="modal-content">
			<h4>Set username</h4>
			<div class="file-field input-field col s12 m8">
				<div class="btn">
					<span>File</span>
					<input type="file" onchange="previewAvatar(document.getElementById('avatarPreview'), document.getElementById('file').files[0])" id="file">
				</div>
				<div class="file-path-wrapper">
					<input class="file-path validate" type="text">
				</div>
			</div>
			<div class="col s12 m4 center">
				<img src="https://discordapp.com/assets/2c21aeda16de354ba5334551a883b481.png" style="height: 100px" alt="Preview" id="avatarPreview">
			</div>
		</div>
		<div class="modal-footer">
			<a class="modal-action modal-close waves-effect waves-light btn-flat">Cancel</a>
			<a class="modal-action modal-close waves-effect waves-green btn-flat" onclick="changeAvatar(client, document.getElementById('file').files[0])">Set Profile</a>
		</div>
	`;
	$('#modal').modal('open');
};
const previewAvatar = (img, file) => { // eslint-disable-line no-unused-vars
	const reader = new FileReader();

	reader.addEventListener('load', () => {
		img.src = reader.result;
	}, false);

	if (file) {
		reader.readAsDataURL(file);
	}
};
const messageOwner = (bot, guildid, text) => { // eslint-disable-line no-unused-vars
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
};
const messageGeneral = (bot, guildid, text) => { // eslint-disable-line no-unused-vars
	bot.guilds.get(guildid).defaultChannel.send(text)
		.then(() => {
			Materialize.toast('Sent message.', 4000);
		})
		.catch((err) => {
			Materialize.toast(`Error in sending message: ${err.message}`, 4000);
		});
};
const changeUsername = (bot, text) => { // eslint-disable-line no-unused-vars
	if (!text) {
		Materialize.toast('Did not change username', 4000);
	} else {
		bot.user.setUsername(text)
			.then((user) => {
				Materialize.toast(`Changed username to ${user.username}`, 4000);
			})
			.catch((err) => {
				Materialize.toast(`Error in changing username: ${err.message}`, 4000);
			});
	}
};
const changeAvatar = (bot, file) => { // eslint-disable-line no-unused-vars
	if (!file) {
		Materialize.toast('Did not change profile', 4000);
	} else {
		const reader = new FileReader();
		reader.readAsDataURL(file);

		reader.addEventListener('load', () => {
			console.dir(reader.result);

			bot.user.setAvatar(reader.result)
				.then(() => {
					Materialize.toast('Changed avatar', 4000);
				})
				.catch((err) => {
					Materialize.toast(`Error in changing avatar: ${err.message}`, 4000);
				});
		}, false);
	}
};
const pruneBots = (bot, minimum, percentage) => { // eslint-disable-line no-unused-vars
	guildsStats(bot).guilds.filter(guild => guild.total > minimum && guild.percentage > percentage).forEach((guild) => {
		removeGuild(bot, guild.id);
	});
};

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
