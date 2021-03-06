require("dotenv").config();
const DPFX = process.env.DISCORD_PREFIX;
const _ = require("lodash");

const api = require("./api/api.js");
const stats = require("./api/stats.js");
// feel free to delete example below
async function test() {
  console.log("Getting user keys (fake data) and all bets")
  const users = await api.get_all_user_keys();
  const bets = await api.get_resolved_bets();
  console.log(users, "\n", bets.out_str)
}

const {
  readdirSync
} = require("fs");
const {
  join
} = require("path");
const MusicClient = require("./struct/Client");
const Bet = require("./struct/Bet");
const {
  Collection
} = require("discord.js");
const client = new MusicClient({
    token: process.env.DISCORD_TOKEN,
    prefix: process.env.DISCORD_PREFIX,
  });
/*
const commandFiles = readdirSync(join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles){
const command = require(join(__dirname, 'commands', `${file}`));
client.commands.set(command.name, command);
}
 */
let currentBet = null;
let currentBetMessage = null;
let voteMaster = null;
function resetBet() {
  currentBet = null;
  currentBetMessage = null;
  voteMaster = null;
}

client.once("ready", () => console.log("Discord bot listening"));
client.on("message", (message) => {
  // ***************** custom code starts here *********************************************

  if (message.content.startsWith(DPFX + "mystats")) {
    stats.get_user_data(message.author.id).then( (s) => message.channel.send(s) );
  }

  if (currentBet != null) {
    if (message.content.startsWith(DPFX + "vote")) {
      let content = message.content
        .slice(6, message.content.length);
      // if (message.reference != null
      //    && message.reference.messageID != null
      //    && message.reference.messageID == currentBetMessage.id) {
      currentBet.processResponse(content, message.author);
    }
    // if (message.content.startsWith("!close") && voteMaster === message.author.id) {
    if (message.content.startsWith(DPFX + "close")) {
      message.channel.send(`votes are closed! all voters must react either 👍 or 👎 to confirm the results of the bet.\n${currentBet.content}`)
      .then((m) => {
        const filter = (reaction, user) => !user.bot;
        const collector = m.createReactionCollector(filter);
        m.react("👍");
        m.react("👎");
        collector.on("collect", (reaction, user) => {
          console.log("got reaction " + reaction.emoji.name);
          if (user.id in currentBet.participants) {
            currentBet.participants[user.id].voted = true;
            currentBet.participants[user.id].outcomeVote = (reaction.emoji.name == "👍") ? 0 : 1;
          }

          let allUsersVoted = true;
          let previousParticipantPosition = -1;
          let participantsAgree = true;
          for (let id in currentBet.participants) {
            let participant = currentBet.participants[id];
            if (participant["voted"] === undefined || !participant["voted"]) {
              allUsersVoted = false;
              break;
            }
            if (previousParticipantPosition == -1) {
              previousParticipantPosition = participant.outcomeVote;
            } else if (previousParticipantPosition != participant.outcomeVote) {
              participantsAgree = false;
              break;
            }
          }

          if (allUsersVoted && participantsAgree) {
            collector.stop();
          }
        });

        collector.on("end", async(collected) => {
          // resetBet();
          m.channel.send("everyone agrees on: " + currentBet.content + "\nis: " + currentBet.betOptions[currentBet.getBetOutcome()]);
          await api.push_resolved_bet(currentBet);
          resetBet();
        });
      });
      }
    }

    if (message.content.startsWith(DPFX + "bet")) {
      if (currentBetMessage != null) {
        message.channel.send("hey there's already a bet going");
        return;
      }
      let time = 60000;
      content = message.content
        .slice(5, message.content.length);
      voteMaster = message.author.id;
      currentBet = new Bet(content, message.author,
          (s, type) => {
          return message.channel.send(s).then((m) => {
            if (type == "initial")
              currentBetMessage = m;
          })
        });

      //     // // this function should calculate the transactions that should happen
      //     // // based on the bet outcome and then execute them on a database

      //     // // each user has an absolute balance, and also a relative balance for each user
      //     // writeFinishedBetToLedger(betObject);

      //     // // allow "non bet" settlements for user to user debt adjustment
      //     // addSettlement(fromUserId, toUserId, amount);

      //     // // checking what your ledger looks like
      //     // getLedgerRelationship(userid1, userid2);
      //     // getAllLedgerRelationships(userid);

      //     // try {
      //     //   for (let key of ["👍", "👎"]) {
      //     //     if (collected.get(key) === undefined) continue;
      //     //     let users = await collected.get(key).users.fetch();
      //     //     let usernames = "";
      //     //     for (const key2 of users.keys()) {
      //     //       usernames += users.get(key2).username + ", ";
      //     //     }
      //     //     message.channel.send(
      //     //       key + " " + (users.size - 1) + ": " + usernames
      //     //     );
      //     //   }
      //     // } catch (e) {
      //     //   message.channel.send(
      //     //     `error! bets are off for: ${splitContent[0]} vs ${splitContent[1]}`
      //     //   );
      //     // }
      //   });
    }

    // ***************** custom code ends here *********************************************
    if (!message.content.startsWith(client.config.prefix) || message.author.bot)
      return;
    const args = message.content.slice(client.config.prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command =
      client.commands.get(commandName) ||
      client.commands.find(
        (cmd) => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command)
      return;
    if (command.guildOnly && message.channel.type !== "text")
      return message.reply("I can't execute that command inside DMs!");
    if (command.args && !args.length) {
      let reply = `You didn't provide any arguments, ${message.author}!`;
      if (command.usage)
        reply += `\nThe proper usage would be: \`${client.config.prefix}${command.name} ${command.usage}\``;
      return message.channel.send(reply);
    }
    if (!client.cooldowns.has(command.name)) {
      client.cooldowns.set(command.name, new Collection());
    }
    const now = Date.now();
    const timestamps = client.cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return message.reply(
          `please wait ${timeLeft.toFixed(
          1
        )} more second(s) before reusing the \`${command.name}\` command.`);
      }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
      command.execute(message, args);
    } catch (error) {
      console.error(error);
      message.reply("there was an error trying to execute that command!");
    }
  });

  client.login(client.config.token);
