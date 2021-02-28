const dotenv = require("dotenv");
const _ = require("lodash");
dotenv.config();
var redis = require("promise-redis")();
const client = redis.createClient(process.env.REDIS_URL);
const fs = require("fs");
const msg_obj = require("message.json");

function getUserTransactions(userid) {}

function getRelative() {}

function addUserTransaction(obj, userid) {}

function ingestBet(betObject) {}

`
!status [self|@someone|@a @b]
  self:     get balance_hist vs all relevant others
  @someone: get balance_hist between a and b (plus history?)
  @a @b:    get balance_hist
!list
  get all users and balance_hist?
!get @
!settle
`;

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
