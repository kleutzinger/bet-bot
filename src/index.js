require("dotenv").config();

const _ = require("lodash");

const {
  readdirSync
} = require("fs");
const {
  join
} = require("path");
const MusicClient = require("./struct/Client");
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
let currentBetMessage, currentResolveBetMessage, content, affirmativeUsers, negativeUsers;

function resetBet() {
  currentBetMessage = null;
  currentResolveBetMessage = null;
  content = "";
  affirmativeUsers = [];
  negativeUsers = [];
}
resetBet();

let affirmatives = ["yes", "true", "for", "affirmative"];
let negatives = ["no", "false", "against", "negative"];

client.once("ready", () => console.log("READY!"));
client.on("message", (message) => {
  // ***************** custom code starts here *********************************************

  if (currentBetMessage != null) {
    if (message.reference != null
       && message.reference.messageID != null
       && message.reference.messageID == currentBetMessage.id) {

      const NUMERIC_REGEXP = /[-]{0,1}[\d]*[.]{0,1}[\d]+/g;

      let potentialBetValues = message.content.match(NUMERIC_REGEXP);
      let betValue = 1;
      if (potentialBetValues && potentialBetValues.length > 0) {
        betValue = potentialBetValues[0];
      } else {
        // no bet value, default to 1?
      }
      let wasResponseAffirmative = -1;
      for (let affirmative of affirmatives) {
        if (message.content.indexOf(affirmative) >= 0) {
          wasResponseAffirmative = true;
          affirmativeUsers.push(message.user.id);
          _.remove(negativeUsers, message.user.id);
          break;
        }
      }
      for (let negative of negatives) {
        if (message.content.indexOf(negative) >= 0) {
          wasResponseAffirmative = false;
          negativeUsers.push(message.user.id);
          _.remove(affirmativeUsers, message.user.id);
          break;
        }
      }

      if (wasResponseAffirmative != -1) {
        message.channel.send(`${message.author.username} bets ${betValue} ${_.shuffle(["smackeroos", "dingus dollars", "dollars"])[0]} ${wasResponseAffirmative ? "for" : "against"} ${content}`);
      }
    }
  }

  if (message.content.startsWith("!!bet")) {
    if (currentBetMessage != null) {
      message.channel.send("hey there's already a bet going");
      return;
    }
    let time = 60000;
    content = message.content
      .slice(5, message.content.length);

    message.channel
    .send(
      `respond "yes" or "no" to this message with a number to join the betting pool. ${message.author.username} says: ${content}\nvotes close in ${time / 1000} seconds`) 
    .then((newMessage) => {
      currentBetMessage = newMessage;

      setTimeout(function () {
        message.channel.send(
          `votes are closed! all voters must react either 👍 or 👎 to confirm the results of the bet.`)
        .then((closedMessage) => { 
          const filter = (reaction, user) => !user.bot;
          const collector = newMessage.createReactionCollector(filter);

          collector.on("collect", (reaction, user) => {

          });

          collector.on("end", (collected) => {
            resetBet();
          });
        });
      }, time);

      // // this function should calculate the transactions that should happen
      // // based on the bet outcome and then execute them on a database

      // // each user has an absolute balance, and also a relative balance for each user
      // writeFinishedBetToLedger(betObject);

      // // allow "non bet" settlements for user to user debt adjustment
      // addSettlement(fromUserId, toUserId, amount);

      // // checking what your ledger looks like
      // getLedgerRelationship(userid1, userid2);
      // getAllLedgerRelationships(userid);

      // try {
      //   for (let key of ["👍", "👎"]) {
      //     if (collected.get(key) === undefined) continue;
      //     let users = await collected.get(key).users.fetch();
      //     let usernames = "";
      //     for (const key2 of users.keys()) {
      //       usernames += users.get(key2).username + ", ";
      //     }
      //     message.channel.send(
      //       key + " " + (users.size - 1) + ": " + usernames
      //     );
      //   }
      // } catch (e) {
      //   message.channel.send(
      //     `error! bets are off for: ${splitContent[0]} vs ${splitContent[1]}`
      //   );
      // }
    });
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
