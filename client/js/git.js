var now = Date.now();
var updates = {
	"mss-discord-git": "https://api.github.com/repos/moustacheminer/mss-discord/commits",
	"reddit-plugin-thebutton-git": "https://api.github.com/repos/lepon01/reddit-plugin-thebutton/commits",
	"reddit-plugin-robin-git": "https://api.github.com/repos/lepon01/reddit-plugin-robin/commits",
	"discordlink-git": "https://api.github.com/repos/lepon01/discordlink/commits",
	"discordlinkpebble-git": "https://api.github.com/repos/lepon01/discordlinkpebble/commits",
	"reddit-plugin-place-opensource-git": "https://api.github.com/repos/lepon01/reddit-plugin-place-opensource/commits"
};

$.each(updates, function(index, element) {
	$.get(element, function(body) {
		let time = Date.parse(body[0]["commit"]["committer"]["date"]);
		let duration = durationMS(now - time);
		let text = "Last commit: " + body[0]["sha"] + ", " + duration + "ago.";
		let element = "#" + index

		console.log(index);
		console.log(element);
		console.log(text);
		$(element).text(text);
	});
});


function durationMS(ms) {
	var d, h, m, s;
	s = Math.floor(ms / 1000);
	m = Math.floor(s / 60);
	s = s % 60;
	h = Math.floor(m / 60);
	m = m % 60;
	d = Math.floor(h / 24);
	h = h % 24;

	var message = "";
	if(d > 0) message += d + " days ";
	if(h > 0) message += h + " hours ";
	if(m > 0) message += m + " minutes ";
	if(s > 0) message += s + " seconds ";

	return message;
}
