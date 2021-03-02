const api = require("./api.js");
const _ = require("lodash");
const AARON = "295639034024165377";
const KEVIN = "375853833466675232";
async function get_balance(A, B) {}

async function run_all(bets) {
  const balance_table = {};
  for (const bet of bets) {
    run_single(bet);
  }
}

async function get_user_data(user_id, bets) {
  const balance_table = {};
  const all_bets = (await api.get_resolved_bets()).data;
  for (const bet of all_bets) {
    if (user_id in bet.participants) {
      console.log(run_single(bet));
    }
  }
}

async function run_single(bet) {
  let num_options = bet.betOptions.length;
  let participants = bet.participants;
  let balance_table = {};
  // [ A,   B ]
  // jody, aaron  kevin,ian
  // $          <=   $$
  // $$$ aaron + jody
  // aaron payout =  (aaron / total ) * total_pool
  // goal aaron money delta for this betOptions
  let winners = _.filter(participants, (p) => {
    return p.position === p.outcomeVote;
  });
  let losers = _.filter(participants, (p) => {
    return p.position !== p.outcomeVote;
  });
  let winner_payout_ratios = {};

  for (let winner of winners) {
    console.table(winner);
  }
  console.log("winners:", winners);
  console.log("losers", losers);
}

const examples = [
  {
    time: 60000,
    content: " this is the first bet in the database",
    variant: "truefalse",
    type: "choose1",
    originalMessage: "",
    betOptions: ["TRUE", "FALSE"],
    participants: {
      "295639034024165377": {
        id: "295639034024165377",
        username: "pork",
        position: 1,
        betValue: 1,
        voted: true,
        outcomeVote: 0,
      },
      "375853833466675232": {
        id: "375853833466675232",
        username: "KevbotSSBM",
        position: 0,
        betValue: 12,
        voted: true,
        outcomeVote: 0,
      },
    },
    channelId: "",
  },
  {
    time: 60000,
    content: " this is the first bet in the database",
    variant: "truefalse",
    type: "choose1",
    originalMessage: "",
    betOptions: ["TRUE", "FALSE"],
    participants: {
      "295639034024165377": {
        id: "295639034024165377",
        username: "pork",
        position: 0,
        betValue: 1,
        voted: true,
        outcomeVote: 0,
      },
      "375853833466675232": {
        id: "375853833466675232",
        username: "KevbotSSBM",
        position: 1,
        betValue: 20,
        voted: true,
        outcomeVote: 0,
      },
    },
    channelId: "",
  },
  {
    time: 60000,
    content: " this is the first bet in the database",
    variant: "truefalse",
    type: "choose1",
    originalMessage: "",
    betOptions: ["TRUE", "FALSE"],
    participants: {
      "295639034024165377": {
        id: "295639034024165377",
        username: "pork",
        position: 0,
        betValue: 1,
        voted: true,
        outcomeVote: 0,
      },
      "375853833466675232": {
        id: "375853833466675232",
        username: "KevbotSSBM",
        position: 0,
        betValue:
          "87340287402938740298374092837402983740293874029837402983740298374092837409283740298374093287402983740293874093287402987402938740298472039874",
        voted: true,
        outcomeVote: 0,
      },
    },
    channelId: "",
  },
];

run_all(examples);
