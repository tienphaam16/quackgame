const getGoldenDuckInfo = require("../modules/getGoldenDuckInfo");
const getGoldenDuckReward = require("../modules/getGoldenDuckReward");
const claimGoldenDuck = require("../modules/claimGoldenDuck");
const addLog = require("../modules/addLog");
const Timer = require("easytimer.js").Timer;
const randomUseragent = require("random-useragent");

const ua = randomUseragent.getRandom((ua) => {
  return ua.browserName === "Chrome";
});
// console.log(ua);

let run = false;
let timerInstance = new Timer();
let accessToken = null;
let timeToGoldenDuck = 0;
let eggs = 0;
let pepet = 0;

async function collectGoldenDuckInternal(token) {
  try {
    const data = await getGoldenDuckInfo(accessToken, ua);
    // console.log("collectGoldenDuckInternal", data);

    if (data.time_to_golden_duck === 0) {
      console.log("[ GOLDEN DUCK 🐥 ] : ZIT ZANG xuat hien");
      const rewardData = await getGoldenDuckReward(accessToken, ua);
      // console.log("rewardData", rewardData);
      if (rewardData.data.type === 0) {
        console.log("[ GOLDEN DUCK 🐥 ] : Chuc ban may man lan sau");
        addLog("[ GOLDEN DUCK 🐥 ] : Chuc ban may man lan sau\n");
      } else if (rewardData.data.type === 1 || rewardData.data.type === 4) {
        console.log("[ GOLDEN DUCK 🐥 ] : TON | TRU > SKIP");
        addLog("[ GOLDEN DUCK 🐥 ] : TON | TRU > SKIP\n");
      } else {
        const claimReward = await claimGoldenDuck(
          accessToken,
          ua,
          rewardData.data
        );
        // console.log("claimReward", claimReward);
        if (rewardData.data.type === 2) pepet += Number(rewardData.data.amount);
        if (rewardData.data.type === 3) eggs += Number(rewardData.data.amount);
        console.clear();
        collectGoldenDuck(token);
      }
    } else {
      timeToGoldenDuck = data.time_to_golden_duck + 1;
      console.log(`[ GOLDEN DUCK 🐥 ] : ${timeToGoldenDuck}s nua gap`);
      setTimeout(() => {
        console.clear(), collectGoldenDuck(token);
      }, timeToGoldenDuck * 1e3);
    }
  } catch (error) {
    console.log("collectGoldenDuckInternal error", error);
  }
}

async function collectGoldenDuck(token) {
  try {
    if (!run) timerInstance.start();

    console.log("[ ONLY GOLDEN DUCK MODE ]");
    console.log();
    console.log("LINK TOOL : [ j2c.cc/quack ]");
    console.log(
      `THOI GIAN CHAY : [ ${timerInstance
        .getTimeValues()
        .toString(["days", "hours", "minutes", "seconds"])} ]`
    );
    console.log(`TONG THU HOACH : [ ${eggs} EGG 🥚 ] [ ${pepet} 🐸 ]`);
    console.log();

    run = true;
    accessToken = token;

    collectGoldenDuckInternal(token);
  } catch (error) {
    console.log("collectGoldenDuck error", error);
  }
}

module.exports = collectGoldenDuck;
