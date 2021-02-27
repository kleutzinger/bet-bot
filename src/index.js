require('dotenv').config();

const _ = require('lodash');

const
{
    readdirSync
} = require('fs');
const
{
    join
} = require('path');
const MusicClient = require('./struct/Client');
const
{
    Collection
} = require('discord.js');
const client = new MusicClient(
    {
        token: process.env.DISCORD_TOKEN,
        prefix: process.env.DISCORD_PREFIX
    }
    );

const commandFiles = readdirSync(join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles)
{
    const command = require(join(__dirname, 'commands', `${file}`));
    client.commands.set(command.name, command);
}
client.once('ready', () => console.log('READY!'));
client.on('message', message =>
{
    // ***************** custom code starts here *********************************************

    if (message.content.startsWith("!bet"))
    {
    	let splitContent = message.content.slice(4,message.content.length).split(",");
    	if (splitContent.length <= 1) {
    		splitContent = message.content.slice(4,message.content.length).split(" ");
    		if (splitContent.length <= 1) return;
    	}
    	console.log(message);
    	console.log(message.content);
        message.channel.send(`react 👍 for ${splitContent[0]} or 👎 for ${splitContent[1]}`)
        .then(newMessage =>
        {
        	newMessage.react("👍");
        	newMessage.react("👎");
			const filter = (reaction, user) => !user.bot;
			const collector = newMessage.createReactionCollector(filter, { time: 7000 });
			// collector.on('collect', r => {
   //      		console.log(r.users.fetch());
			// 	console.log(`Collected ${r.emoji.name}`);
			// });
			collector.on('end', async collected => {
				console.log(`Collected ${collected.size} items`)
				console.log(collected);
				try {
					for (let key of ["👍", "👎"]) {
						console.log(key);
						if (collected.get(key) === undefined) continue;
						let users = await collected.get(key).users.fetch();
						console.log(users);
						if (key == "👍") {
							message.channel.send("👍 " + (users.size - 1));
						}
						if (key == "👎") {
							message.channel.send("👎 " + (users.size - 1));
						}
					}
				}
				catch (e) {
					message.channel.send(`error! bets are off for: ${splitContent[0]} vs ${splitContent[1]}`)
					console.log("emoji collection error");
					console.log(e);
				}
			});
        }
        )
        .catch(console.error);
    }

    // ***************** custom code ends here *********************************************
    if (!message.content.startsWith(client.config.prefix) || message.author.bot)
        return;
    const args = message.content.slice(client.config.prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command)
        return;
    if (command.guildOnly && message.channel.type !== 'text')
        return message.reply('I can\'t execute that command inside DMs!');
    if (command.args && !args.length)
    {
        let reply = `You didn't provide any arguments, ${message.author}!`;
        if (command.usage)
            reply += `\nThe proper usage would be: \`${client.config.prefix}${command.name} ${command.usage}\``;
        return message.channel.send(reply);
    }
    if (!client.cooldowns.has(command.name))
    {
        client.cooldowns.set(command.name, new Collection());
    }
    const now = Date.now();
    const timestamps = client.cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    if (timestamps.has(message.author.id))
    {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        if (now < expirationTime)
        {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try
    {
        command.execute(message, args);
    }
    catch (error)
    {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
}
);

client.login(client.config.token);
