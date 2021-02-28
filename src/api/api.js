require("dotenv").config();
const _ = require("lodash");
var redis = require("promise-redis")();
const client = redis.createClient(process.env.REDIS_URL);
console.log(`connected to redis at ${process.env.REDIS_URL.split('@')[1]}`)
const fs = require("fs");

client.on("error", function (err) {
  console.error("Redis Client Error: " + err);
});

function getUserTransactions(userid) {}

function getRelative() {}

function addUserTransaction(obj, userid) {}

function ingestBet(betObject) {}

async function push_one(key, value) {
  // Stores Strings
  try {
    return await client.rpush(key, value);
  } catch (error) {
    console.error(error);
  }
}

async function get_user(key) {
  // Returns array all pushed items
  try {
    return await client.lrange(key, 0, -1);
  } catch (error) {
    console.error(error);
  }
}

async function test() {
  const user = "kevin";
  // can push number (becomes string)
  await push_one(user, 88);
  // can push strings directly
  await push_one(user, "fo twenty");
  // cannot push objects, must JSON.stringify first
  // await push_one(user {k: 200})
  const out = await get_user(user);
  console.log(out);
  client.quit();
}
module.exports = { push_one, get_user };
/* 
!status [self|@someone|@a @b]
  self:     get balance_hist vs all relevant others
  @someone: get balance_hist between a and b (plus history?)
  @a @b:    get balance_hist
!list
  get all users and balance_hist?
!get @
!settle
`;
*/

//   betObject = {
//     type: "choose1",
//     originalMessage: originalMessageObj,
//     betOptions ["yes", "no", "pnastayyy"],
//     participants [
//        {
//          betOptionIdx,
//          wagerAmount,
//          fullMessageObj
//        } ...
//      ]
// }
