const getGoldenDuckInfo = require("../modules/getGoldenDuckInfo");
const getGoldenDuckReward = require("../modules/getGoldenDuckReward");
const claimGoldenDuck = require("../modules/claimGoldenDuck");
const addLog = require("../modules/addLog");
const Timer = require("easytimer.js").Timer;
const randomUseragent = require("random-useragent");
const goldenDuckRewardText = require("../modules/goldenDuckRewardText");

const ua = randomUseragent.getRandom((ua) => {
  return ua.browserName === "Chrome";
});
// console.log(ua);

const ERROR_MESSAGE = "Chup man hinh va tao issue Github de tui tim cach fix";

let run = false;
let timerInstance = new Timer();
let accessToken = null;
let timeToGoldenDuck = 0;
let eggs = 0;
let pepet = 0;
let goldenDuck = 0;
let myInterval = null;

async function collectGoldenDuckInternal(token) {
  if (timeToGoldenDuck <= 0) {
    const collectGoldenDuckInternalData = await getGoldenDuckInfo(
      accessToken,
      ua
    );
    // console.log(
    //   "collectGoldenDuckInternalData",
    //   collectGoldenDuckInternalData
    // );

    if (collectGoldenDuckInternalData.error_code !== "") {
      console.log(
        "collectGoldenDuckInternalData error",
        collectGoldenDuckInternalData.error_code
      );
      console.log(ERROR_MESSAGE);
    } else {
      if (collectGoldenDuckInternalData.data.time_to_golden_duck === 0) {
        clearInterval(myInterval);

        console.log("[ GOLDEN DUCK 🐥 ] : ZIT ZANG xuat hien");
        const getGoldenDuckRewardData = await getGoldenDuckReward(
          accessToken,
          ua
        );
        // console.log("getGoldenDuckRewardData", getGoldenDuckRewardData);

        const data = getGoldenDuckRewardData;
        if (data.data.type === 0) {
          console.log("[ GOLDEN DUCK 🐥 ] : Chuc ban may man lan sau");
          addLog("[ GOLDEN DUCK 🐥 ] : Chuc ban may man lan sau");
        } else if (data.data.type === 1 || data.data.type === 4) {
          console.log("[ GOLDEN DUCK 🐥 ] : TON | TRU > SKIP");
          addLog("[ GOLDEN DUCK 🐥 ] : TON | TRU > SKIP");
        } else {
          const claimGoldenDuckData = await claimGoldenDuck(
            accessToken,
            ua,
            data.data
          );
          // console.log("claimGoldenDuckData", claimGoldenDuckData);

          goldenDuck++;

          if (data.data.type === 2) pepet += Number(data.data.amount);
          if (data.data.type === 3) eggs += Number(data.data.amount);

          console.log(
            `[ GOLDEN DUCK 🐥 ] : ${goldenDuckRewardText(data.data)}`
          );
          addLog(`[ GOLDEN DUCK 🐥 ] : ${goldenDuckRewardText(data.data)}`);

          collectGoldenDuck(token);
        }
      } else {
        timeToGoldenDuck =
          collectGoldenDuckInternalData.data.time_to_golden_duck;

        myInterval = setInterval(() => {
          timeToGoldenDuck--;
          checkTimeToGoldenDuck(token);
        }, 1e3);
      }
    }
  }
}

function checkTimeToGoldenDuck(token) {
  console.clear();

  if (timeToGoldenDuck <= 0) {
    clearInterval(myInterval);
    myInterval = null;
    collectGoldenDuckInternal(token);
  } else {
    collectGoldenDuck(token);
  }
}

async function collectGoldenDuck(token) {
  accessToken = token;

  if (!run) {
    timerInstance.start();
    run = true;
  }

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

  msg = `[ GOLDEN DUCK 🐥 ] : [ ${goldenDuck} 🐥 ] | ${timeToGoldenDuck}s nua gap`;
  console.log(msg);

  collectGoldenDuckInternal(token);
}

module.exports = collectGoldenDuck;
