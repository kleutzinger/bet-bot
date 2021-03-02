const db = require("./db.js");
const GLOBAL_BETS_KEY = "global_bets";
const _ = require('lodash')

async function push_resolved_bet(betObj) {
  try {
    if (typeof betObj !== "string") {
      betObj = JSON.stringify(betObj);
    }
    const data = await db.redis.rpush(GLOBAL_BETS_KEY, betObj);
    return { data, out_str: `added 1 bet` };
  } catch (error) {
    console.error(error);
  }
}

async function get_resolved_bets() {
  try {
    const bet_list = await db.redis.lrange(GLOBAL_BETS_KEY, 0, -1);
    const parsed_bet_list = bet_list.map((e) => JSON.parse(e));
    const out_str = `found ${parsed_bet_list.length} resolved bets`;
    return { data: parsed_bet_list, out_str };
  } catch (error) {
    console.error(error);
  }
}

async function test() {
  const bets = (await get_resolved_bets()).data;
  const fs = require('fs')
  fs.writeFileSync('out.json', JSON.stringify(bets))
  console.log(JSON.stringify(bets));
}


module.exports = {
  push_resolved_bet,
  get_resolved_bets,
  get_all_user_keys: async () => {
    const all_bets = await get_resolved_bets();
    const fake_key_list = ["375853833466675232",  "295639034024165377"];


    return Promise.resolve({
      data: fake_key_list,
      out_str: "all participants: " + fake_key_list.join(", "),
    });
  },
  get_user_data: async (user_key) => {
    return Promise.resolve({ data: [], out_str: `[data of ${key}]` });
  },
  get_relative_data: async (user_a_key, user_b_key) => {
    return Promise.resolve({
      data: [],
      out_str: `${user_a} owes ${user_b}:\nTODO`,
    });
  },
  delete_all_bets: async () => {db.redis.del(GLOBAL_BETS_KEY)}
};
