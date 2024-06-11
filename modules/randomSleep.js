const config = require("../config.json");

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomSleep() {
  const sec = getRndInteger(config.minSleepTime, config.maxSleepTime);
  console.log(`sleep ${sec}s`);
  return new Promise((resolve) => setTimeout(resolve, sec * 1e3));
}

module.exports = randomSleep;
