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

let myInterval = null;

async function collectGoldenDuckInternal(token) {
  try {
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
          console.log("[ GOLDEN DUCK 🐥 ] : ZIT ZANG xuat hien");
          const getGoldenDuckRewardData = await getGoldenDuckReward(
            accessToken,
            ua
          );
          // console.log("getGoldenDuckRewardData", getGoldenDuckRewardData);
          if (getGoldenDuckRewardData.data.type === 0) {
            console.log("[ GOLDEN DUCK 🐥 ] : Chuc ban may man lan sau");
            addLog("[ GOLDEN DUCK 🐥 ] : Chuc ban may man lan sau\n");
          } else if (
            getGoldenDuckRewardData.data.type === 1 ||
            getGoldenDuckRewardData.data.type === 4
          ) {
            console.log("[ GOLDEN DUCK 🐥 ] : TON | TRU > SKIP");
            addLog("[ GOLDEN DUCK 🐥 ] : TON | TRU > SKIP\n");
          } else {
            const claimGoldenDuckData = await claimGoldenDuck(
              accessToken,
              ua,
              getGoldenDuckRewardData.data
            );
            // console.log("claimGoldenDuckData", claimGoldenDuckData);

            if (claimGoldenDuckData.error_code !== "") {
              console.log(
                "claimGoldenDuckData error",
                claimGoldenDuckData.error_code
              );
              console.log(ERROR_MESSAGE);
            } else {
              if (getGoldenDuckRewardData.data.type === 2)
                pepet += Number(getGoldenDuckRewardData.data.amount);
              if (getGoldenDuckRewardData.data.type === 3)
                eggs += Number(getGoldenDuckRewardData.data.amount);

              console.log(
                `[ GOLDEN DUCK 🐥 ] : ${goldenDuckRewardText(
                  getGoldenDuckRewardData.data
                )}`
              );
              addLog(
                `[ GOLDEN DUCK 🐥 ] : ${goldenDuckRewardText(
                  getGoldenDuckRewardData.data
                )}\n`
              );

              clearInterval(myInterval);
              collectGoldenDuck(token);
            }
          }
        } else {
          timeToGoldenDuck =
            collectGoldenDuckInternalData.data.time_to_golden_duck;
        }

        myInterval = setInterval(() => {
          timeToGoldenDuck--;

          console.clear();
          collectGoldenDuck(token);

          console.log(`[ GOLDEN DUCK 🐥 ] : ${timeToGoldenDuck}s nua gap`);
        }, 1e3);
      }
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
