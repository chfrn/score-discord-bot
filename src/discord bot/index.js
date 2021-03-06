const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');
//client id 718181530945454132
//const token = JSON.parse(fs.readFileSync('token.json'));
const TOKEN = process.env.token;
var config;
//test2

//changing 1000 to 10000.

/*
var sieve = [];
for(var i = 0; i <= 10000; i++) sieve.push(true);
for(var i = 2; i*i <= 10000; i++) {
	if(!sieve[i]) continue;
	for(var j = i*i; j <= 10000; j += i) {
		sieve[j] = false;
	}
}
*/

var sieve = JSON.parse(fs.readFileSync('primes.json'));

/*
temp = {
	arr: []
}
for(var i = 0; i <= 1000; i++) temp.arr.push(sieve[i]);
fs.writeFileSync('primes.json', JSON.stringify(temp));
*/
const MOD = 10007;

bot.on('ready', () => {
	config = JSON.parse(fs.readFileSync('config.json'));
	console.log('Bot is ready.');
});

bot.on('guildCreate', (guild) => {
	console.log('Joined ' + guild.name);
	config[guild.id] = {
		'prefix': '!',
		'top': []
	};
	fs.writeFileSync('config.json', JSON.stringify(config));
	console.log('Updated config.json.');
});

bot.on('message', (msg) => {
	if(msg.author.bot) return;
	if(msg.content.slice(0, 3).toLowerCase() == 'i\'m') {
		var args = msg.content.split(' ');
		if(args.length == 1) return;
		if(args.slice(2, args.length).join(" ").length > 1500) return;
		msg.channel.send('Hello ' + args.slice(1, args.length).join(" ") + ', I\'m Score!');
	}
	if(msg.content.slice(0, 4).toLowerCase() == 'i am') {
		var args = msg.content.split(' ');
		if(args.length == 2) return;
		if(args.slice(2, args.length).join(" ").length > 1500) return;
		msg.channel.send('Hello ' + args.slice(2, args.length).join(" ") + ', I\'m Score!');
	}
	if(msg.content[0] !== config[msg.guild.id].prefix) return;
	msg.content = msg.content.slice(1, msg.content.length).toLowerCase();
	var args = msg.content.split(' ');
	if(args[0] === 'prefix' && args.length > 1) {
		config[msg.guild.id].prefix = args[1];
		fs.writeFileSync('config.json', JSON.stringify(config));
		msg.channel.send('The new prefix has been set to ' + config[msg.guild.id].prefix);
		return;
	}
	if(args[0] === 'help') {
		/*
		msg.channel.send({
   			files: ['./help.png']
		});
		*/
		msg.channel.send('Try to reverse engineer the scoring system at https://github.com/peelstnac/score-game. Max score is 10006.');
	}
	if(args[0] === 'bet' && args.length == 1) {
		msg.channel.send('Please put a value you are betting.');
		return;
	}
	if(args[0] === 'top') {
		if(config[msg.guild.id].top.length == 0) {
			msg.channel.send('Leaderboard empty.');
			return;
		}
		msg.channel.send('Top score of ' + config[msg.guild.id].top[1] + ' by ' + config[msg.guild.id].top[0]);
	}
	if(args[0] === 'bet') {
		if(!Number.isInteger(parseInt(args[1]))) {
			msg.channel.send('Please put an integer between 1 and 10000 inclusive to bet.');
			return;
		}
		var m = parseInt(args[1]);
		if(m < 1 || m > 10000) {
			msg.channel.send('Please put an integer between 1 and 10000 inclusive to bet.');
			return;
		}
		msg.channel.send('Calculating score...');
		var values = JSON.parse(fs.readFileSync('values.json'));
		if(values.arr.length > 20) {
			values.arr = [parseInt(Math.random()*10000)];
			fs.writeFileSync('values.json', JSON.stringify(values));
			console.log('Refreshed values.')
		}
		var M = m;
		if(M == 1) m = 2;
		else if (M > 9973) m = 9973;
		else {
			var r = Math.random();
			if(r <= 0.5) {
				for(var i = m; i >= 2; i--) {
					if(sieve[i]) {
						m = i;
						break;
					}
				}
			}
			else {
				for(var i = m; i <= 9973; i++) {
					if(sieve[i]) {
						m = i;
						break;
					}
				}
			}
		}
		var inv = [1, 1];
		for (var i = 2; i < m; i++) {
		  inv[i] = (m - ((parseInt(m / i) * inv[m % i]) % m)) % m;
		}
		var score = 1;
		for (var i = 0; i < values.arr.length; i++) {
		  if(i%2==0) score *= inv[values.arr[i] % m];
		  else score *= values.arr[i];
		  score %= MOD;
		}
		msg.channel.send('You score is ' + score);
		values.arr.push(M);
		fs.writeFileSync('values.json', JSON.stringify(values));
		if(config[msg.guild.id].top.length == 0) {
			msg.channel.send('New server high score of ' + score + ' from ' + msg.author.toString());
			config[msg.guild.id].top = [msg.author.toString(), score];
			fs.writeFileSync('config.json', JSON.stringify(config));
			return;
		}
		if(score > config[msg.guild.id].top[1]) {
			msg.channel.send('New server high score of ' + score + ' from ' + msg.author.toString());
			config[msg.guild.id].top = [msg.author.toString(), score];
			fs.writeFileSync('config.json', JSON.stringify(config));
			return;
		}
	}
});

bot.login(TOKEN);