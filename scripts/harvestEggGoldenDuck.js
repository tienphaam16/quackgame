const getListReload = require("../modules/getListReload");
const collectEgg = require("../modules/collectEgg");
const layEgg = require("../modules/layEgg");
const sleep = require("../modules/sleep");
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

const config = require("../config.json");
const goldenDuckRewardText = require("../modules/goldenDuckRewardText");
// console.log(config);

const ERROR_MESSAGE = "Chup man hinh va tao issue Github de tui tim cach fix";

const RARE_EGG = [
  undefined,
  "COMMON",
  "COMMON *",
  "UNCOMMON",
  "UNCOMMON *",
  "RARE",
  "RARE *",
  "EPIC",
  "EPIC *",
  "LEGENDARY",
  "LEGENDARY *",
  "MYTHIC",
  "MYTHIC *",
  "ETERNAL",
  "ETERNAL *",
];

let run = false;
let timerInstance = new Timer();
let eggs = 0;
let pepet = 0;
let timeToGoldenDuck = 0;
let accessToken = null;

function getDuckToLay(ducks) {
  const duck = ducks.reduce((prev, curr) =>
    prev.last_active_time < curr.last_active_time ? prev : curr
  );

  return duck;
}

async function collectFromList(token, listNests, listDucks) {
  if (listNests.length === 0)
    return console.clear(), harvestEggGoldenDuck(token);
  // if (listNests.length === 0) return harvestEggGoldenDuck(token);
  // console.log(listNests.length, listDucks.length);

  const status = listNests[0].status;
  // console.log(status);

  if (status === 2) {
    const collectEggData = await collectEgg(token, ua, listNests[0].id);
    // console.log("collectEggData", collectEggData);
    if (collectEggData.error_code !== "") {
      if (collectEggData.error_code === "THIS_NEST_DONT_HAVE_EGG_AVAILABLE") {
        const duck = getDuckToLay(listDucks);
        const layEggData = await layEgg(token, ua, listNests[0].id, duck.id);
        // console.log("layEggData", layEggData);

        if (layEggData.error_code !== "") {
          console.log("layEggData status 2 error", layEggData.error_code);
          console.log("");
        } else {
          listDucks = listDucks.filter((d) => d.id !== duck.id);
          await sleep(config.sleepTime);
          harvestEggGoldenDuck(token);
        }
      } else {
        console.log("collectEggData status 2 error", collectEggData.error_code);
        console.log(ERROR_MESSAGE);
      }
    } else {
      const duck = getDuckToLay(listDucks);
      const layEggData = await layEgg(token, ua, listNests[0].id, duck.id);
      // console.log("layEggData", layEggData);

      if (layEggData.error_code !== "") {
        console.log("layEggData status 2.1 error", layEggData.error_code);
        console.log("");
      } else {
        console.log(
          `Da thu hoach [ NEST 🌕 ${listNests[0].id} ] : [ EGG 🥚 ${
            RARE_EGG[listNests[0].type_egg]
          } ]`
        );

        eggs++;
        listNests.shift();
        listDucks = listDucks.filter((d) => d.id !== duck.id);

        // await sleep(config.sleepTime);
        collectFromList(token, listNests, listDucks);
      }
    }
  } else if (status === 3) {
    console.log("Vao game dap cai trung sap no roi chay tool lai");
    console.log(ERROR_MESSAGE);
  }
}

async function harvestEggGoldenDuck(token) {
  try {
    accessToken = token;

    if (!run) timerInstance.start();

    console.log("[ ALL EGG AND GOLDEN DUCK MODE ]");
    console.log();
    console.log("LINK TOOL : [ j2c.cc/quack ]");
    console.log(
      `THOI GIAN CHAY : [ ${timerInstance
        .getTimeValues()
        .toString(["days", "hours", "minutes", "seconds"])} ]`
    );
    console.log(`TONG THU HOACH : [ ${eggs} EGG 🥚 ] [ ${pepet} 🐸 ]`);
    console.log();

    if (timeToGoldenDuck <= 0) {
      const getGoldenDuckInfoData = await getGoldenDuckInfo(accessToken, ua);
      // console.log("getGoldenDuckInfoData", getGoldenDuckInfoData);

      if (getGoldenDuckInfoData.error_code !== "") {
        console.log(
          "getGoldenDuckInfoData error",
          getGoldenDuckInfoData.error_code
        );
        console.log(ERROR_MESSAGE);
      } else {
        if (getGoldenDuckInfoData.data.time_to_golden_duck === 0) {
          console.log("[ GOLDEN DUCK 🐥 ] : ZIT ZANG xuat hien");
          const getGoldenDuckRewardData = await getGoldenDuckReward(
            accessToken,
            ua
          );
          // console.log("getGoldenDuckRewardData", getGoldenDuckRewardData);

          if (getGoldenDuckRewardData.error_code !== "") {
            console.log(
              "getGoldenDuckRewardData error",
              getGoldenDuckRewardData.error_code
            );
            console.log(ERROR_MESSAGE);
          } else {
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
              }
            }
          }
        } else
          timeToGoldenDuck = getGoldenDuckInfoData.data.time_to_golden_duck;

        setInterval(() => {
          timeToGoldenDuck--;
        }, 1e3);
      }
    }

    console.log(`[ GOLDEN DUCK 🐥 ] : ${timeToGoldenDuck}s nua gap`);
    // console.log("timeToGoldenDuck", timeToGoldenDuck);

    const { listNests, listDucks } = await getListReload(
      accessToken,
      ua,
      run ? false : true
    );
    // console.log(listNests, listDucks);

    run = true;
    const nestIds = listNests.map((i) => i.id);
    console.log(`[ ${listNests.length} NEST 🌕 ] :`, nestIds);
    console.log();
    collectFromList(accessToken, listNests, listDucks);
  } catch (error) {
    console.log("harvestEggGoldenDuck error", error);
  }
}

module.exports = harvestEggGoldenDuck;
