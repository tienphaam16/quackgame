const loadToken = require("./modules/loadToken");
const ACCESS_TOKEN = loadToken();

const harvestEggGoldenDuck = require("./scripts/harvestEggGoldenDuck");
// const collectGoldenDuck = require("./scripts/collectGoldenDuck");

harvestEggGoldenDuck(ACCESS_TOKEN);
// collectGoldenDuck(ACCESS_TOKEN);
