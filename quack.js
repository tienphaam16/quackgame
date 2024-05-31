const TELEGRAM_USER = require("./token.json");
const ACCESS_TOKEN = TELEGRAM_USER.state.token;
const randomUseragent = require("random-useragent");

const ua = randomUseragent.getRandom();
// console.log(ua);

const config = require("./config.json");
// console.log(config);

const goldenDuck = require("./scripts/goldenDuck");
const harvestEgg = require("./scripts/harvestEgg");
const hatchEgg = require("./scripts/hatchEgg");

if (config.goldenDuck === "on") goldenDuck(ACCESS_TOKEN, ua);
if (config.harvestEgg === "on") harvestEgg(ACCESS_TOKEN, ua);
if (config.hatchEgg === "on") hatchEgg(ACCESS_TOKEN, ua);
