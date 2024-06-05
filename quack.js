const loadToken = require("./modules/loadToken");
const ACCESS_TOKEN = loadToken();

const args = process.argv;
// console.log(args);
const script = args[2];

const harvestEggGoldenDuck = require("./scripts/harvestEggGoldenDuck");
const collectGoldenDuck = require("./scripts/collectGoldenDuck");

switch (script) {
  case "1":
    collectGoldenDuck(ACCESS_TOKEN);
    break;
  default:
    harvestEggGoldenDuck(ACCESS_TOKEN);
    break;
}
