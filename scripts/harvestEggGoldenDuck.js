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
// console.log(config);

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

async function collectFromList(token, ua, listNests, listDucks) {
  if (listNests.length === 0)
    return console.clear(), harvestEggGoldenDuck(token);
  // if (listNests.length === 0) return harvestEggGoldenDuck(token);
  // console.log(listNests.length, listDucks.length);

  const { data } = await collectEgg(token, ua, listNests[0].id);
  // console.log(data);
  if (data.error_code === "") {
    const duck = getDuckToLay(listDucks);
    await layEgg(token, ua, listNests[0].id, duck.id);
    console.log(`Da thu hoach [ NEST 🌕 ${listNests[0].id} ]`);

    eggs++;
    listNests.shift();
    listDucks = listDucks.filter((d) => d.id !== duck.id);
    // console.log(listNests.length, listDucks.length);

    await sleep(config.sleepTime);
    collectFromList(token, ua, listNests, listDucks);
  } else {
    if (data.error_code === "THIS_NEST_DONT_HAVE_EGG_AVAILABLE") {
      const duck = getDuckToLay(listDucks);
      await layEgg(token, ua, listNests[0].id, duck.id);
      listDucks = listDucks.filter((d) => d.id !== duck.id);
      await sleep(config.sleepTime);
      harvestEggGoldenDuck(token);
    }
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
      const data = await getGoldenDuckInfo(accessToken, ua);
      // console.log("collectGoldenDuck", data);

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
          if (rewardData.data.type === 2)
            pepet += Number(rewardData.data.amount);
          if (rewardData.data.type === 3)
            eggs += Number(rewardData.data.amount);
        }
      } else timeToGoldenDuck = data.time_to_golden_duck;

      setInterval(() => {
        timeToGoldenDuck--;
      }, 1e3);
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
    collectFromList(accessToken, ua, listNests, listDucks);
  } catch (error) {
    console.log("harvestEggGoldenDuck error", error);
  }
}

module.exports = harvestEggGoldenDuck;
