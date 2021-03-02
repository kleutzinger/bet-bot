require("dotenv").config();
const _ = require("lodash");
var redis = require("promise-redis")();
let DB_URL = process.env.DOKKU_REDIS_AQUA_URL;
if (process.env.NODE_ENV === "development") {
  console.log("connecting to staging url");
  DB_URL = process.env.STAGING_REDIS_URL;
}
const client = redis.createClient(DB_URL);
console.log(`connected to redis at ${DB_URL.split("@")[1]}`);

client.on("error", function (err) {
  console.error("Redis Client Error: " + err);
});

async function push_list(key, value) {
  // apends single value to end of list
  try {
    return await client.rpush(key, value);
  } catch (error) {
    console.error(error);
  }
}

async function get_list(key) {
  // Returns array of all values of list at key
  try {
    return await client.lrange(key, 0, -1);
  } catch (error) {
    console.error(error);
  }
}

async function set_key(key, value) {
  // store value string at key
  try {
    return await client.set(key, value);
  } catch (error) {
    console.error(error);
  }
}

async function get_key(key) {
  // get string stored at KEY
  try {
    return await client.get(key);
  } catch (error) {
    console.error(error);
  }
}

async function test() {}
test();

async function startup() {
  const startup_count = await client.incr("startups");
  console.log(`startup_count: ${startup_count}`);
}
startup();
module.exports = { set_key, get_key, push_list, get_list, redis: client };
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
