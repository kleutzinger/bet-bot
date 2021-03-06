
const _ = require("lodash");

let affirmatives = ["yes", "true", "for", "affirmative"];
let negatives = ["no", "false", "against", "negative"];

module.exports = class {
  constructor(originalMessageContent, user, sendFunc) {
    this.sendFunc = sendFunc

      this.time = 60000;
    this.content = originalMessageContent;
 
    this.sendFunc(`${this.content} - ${user.username}.\n`
       + `use !vote yes or !vote no with a number to join the betting pool.`
       + `\nvote initator must use !close to end betting`, "initial");

    // setTimeout(function () {
    //   sendFunc(`votes are closed! all voters must react either 👍 or 👎 to confirm the results of the bet.`
    //     , "closed");
    // }, this.time);

    this.variant = "truefalse";
    this.type = "choose1";
    this.originalMessage = "";
    this.betOptions = ["TRUE", "FALSE"];
    this.participants = {};
    this.channelId = "";
  }

  processResponse(responseText, user) {
    const NUMERIC_REGEXP = /[-]{0,1}[\d]*[.]{0,1}[\d]+/g;

    let potentialBetValues = responseText.match(NUMERIC_REGEXP);
    let betValue = 1;
    if (potentialBetValues && potentialBetValues.length > 0) {
      betValue = potentialBetValues[0];
    } else {
      // no bet value, default to 1?
    }
    let responseIndex = -1;
    for (let i = 0; i < this.betOptions.length; i++) {
      let option = this.betOptions[i];
      if (option == "TRUE") {
        for (let affirmative of affirmatives) {
          if (responseText.indexOf(affirmative) >= 0) {
            responseIndex = 0;
            break;
          }
        }
      } else if (option == "FALSE") {
        for (let negative of negatives) {
          if (responseText.indexOf(negative) >= 0) {
            responseIndex = 1;
            break;
          }
        }
      } else if (responseText.indexOf(option) >= 0) {
        responseIndex = responseText.indexOf(option);
        break;
      }
    }
    
    betValue = Math.max(0.01, parseFloat(betValue));
    if (responseIndex != -1) {
      // if (!(user.id in this.participants)) {
        this.participants[user.id] = {
          id: user.id,
          username: user.username,
          position: responseIndex,
          betValue: betValue
        }
      // }
      if (this.variant == "truefalse") {
        this.sendFunc(
          `${user.username} bets ${betValue} `
           + `${_.shuffle(["smackeroos", "dingus dollars", "dollars"])[0]} `
           + `${responseIndex == 0 ? "for" : "against"} ${content}`, "confirmation");
      }
    }
  }

  getBetOutcome() {
    for (let key in this.participants) {
      return this.participants[key].outcomeVote;
    }
  }
}
