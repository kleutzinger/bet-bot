const api = require("./api.js");
const _ = require("lodash");
const AARON = "295639034024165377";
const KEVIN = "375853833466675232";
async function get_balance(A, B) {}

const id_cache = {};

function run_all(bets) {
  let balance_table = {};
  for (const bet of bets) {
    let balance_delta = run_single(bet);
    balance_table = combine_balance_deltas(balance_table, balance_delta);
  }

  console.log("final balance for everyone");
  console.table(balance_table);
  return balance_table;
}

async function get_user_data(user_id) {
  try {
    // const balance_table = {};
    const all_bets = (await api.get_resolved_bets()).data;
    const balance_table = run_all(all_bets);

    const userBalance = balance_table[user_id];
    let finalString = "**" + id_cache[user_id] + "**:\n";
    for (let id in userBalance) {
      if (id == user_id) continue;
      finalString += id_cache[id] + " " + (parseInt(userBalance[id] * 100)/ 100) + "\n";
    }
    return finalString;
  }
  catch (e) {
    return "sumn broke " + e;
  }
  // for (const bet of all_bets) {
  //   if (user_id in bet.participants) {
  //     console.log(run_single(bet));
  //   }
  // }
}

function combine_balance_deltas(a, b) {
  let all_present_ids = {};
  let c = {};
  for (let id in a) all_present_ids[id] = true;
  for (let id in b) all_present_ids[id] = true;

  for (let id1 in all_present_ids) {
    c[id1] = {};
    for (let id2 in all_present_ids) {
      c[id1][id2] = _.get(a, `${id1}.${id2}`, 0) + _.get(b, `${id1}.${id2}`, 0);
    }
  }
  return c;
}

function run_single(bet) {
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
    id_cache[p.id] = p.username; // update user id cache for the lazy !!!FIX THIS KEVIN
    return p.position === p.outcomeVote;
  });
  let losers = _.filter(participants, (p) => {
    return p.position !== p.outcomeVote;
  });

  let winnersTotalContributions = 0;
  for (let winner of winners) {
    winnersTotalContributions += winner.betValue;
  }

  for (let winner of winners) {
    let winnerBalanceDict = {};
    balance_table[winner.id] = winnerBalanceDict;
    for (let loser of losers) {
      let balance_delta =
        winner.betValue / winnersTotalContributions * loser.betValue;
      winnerBalanceDict[loser.id] = balance_delta;
    }
  }

  for (let loser of losers) {
    let loserBalanceDict = {};
    balance_table[loser.id] = loserBalanceDict;
    for (let winner of winners) {
      let balance_delta = - balance_table[winner.id][loser.id];
      loserBalanceDict[winner.id] = balance_delta;
    }
  }

  return balance_table;
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

// (async () => {
//   const all_bets = (await api.get_resolved_bets()).data;
//   console.log(JSON.stringify(all_bets, null, 2));
//   run_all(all_bets);
// })();

module.exports = {
  get_user_data,
};