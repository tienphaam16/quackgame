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
const hatchEgg = require("../modules/hatchEgg");

const ua = randomUseragent.getRandom((ua) => {
  return ua.browserName === "Chrome";
});
// console.log(ua);

const config = require("../config.json");
const getMaxDuck = require("../modules/getMaxDuck");
const collectDuck = require("../modules/collectDuck");
const removeDuck = require("../modules/removeDuck");

let accessToken = null;
let run = false;
let timerInstance = new Timer();
let eggs = 0;
let pepet = 0;
let timeToGoldenDuck = 0;
let maxDuckSlot = null;
let maxRareEgg = null;
let maxRareDuck = null;

function calculatorRareEgg(nest) {
  return nest - 1;
}

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

const RARE_DUCK = [undefined, "COMMON", "RARE", "LEGENDARY"];

function showRareDuck(duck) {
  return [
    RARE_DUCK[duck.metadata.head_rare],
    RARE_DUCK[duck.metadata.arm_rare],
    RARE_DUCK[duck.metadata.body_rare],
  ].join(", ");
}

function getDuckToLay(ducks) {
  const duck = ducks.reduce((prev, curr) =>
    prev.last_active_time < curr.last_active_time ? prev : curr
  );

  return duck;
}

async function collectFromList(token, ua, listNests, listDucks) {
  if (listNests.length === 0) return console.clear(), hatchEggGoldenDuck(token);
  // if (listNests.length === 0) return hatchEggGoldenDuck(token);
  // console.log(listNests.length, listDucks.length);

  if (listDucks.length <= maxDuckSlot) {
    if (listNests[0].type_egg >= maxRareEgg) {
      // console.log(listNests[0].type_egg);
      console.log(
        `Dang ap [ NEST 🌕 ${listNests[0].id} ] : [ EGG 🥚 ${
          RARE_EGG[listNests[0].type_egg]
        } ]`
      );
      const eggToHatch = await hatchEgg(token, ua, listNests[0].id);
      // console.log("eggToHatch", eggToHatch);
      if (eggToHatch.error_code === "REACH_MAX_NUMBER_OF_DUCK") {
        const duck = listDucks.reduce((prev, curr) =>
          prev.total_rare < curr.total_rare ? prev : curr
        );
        const duckRemoved = await removeDuck(token, ua, duck.id);
        // console.log("duckRemoved", duckRemoved);
        console.log(
          `FARM : [ DUCK 🦆 ${duck.id} : ${showRareDuck(
            duck
          )} ] > vit lor > DELETE`
        );
        addLog(
          `FARM : [ DUCK 🦆 ${duck.id} : ${showRareDuck(
            duck
          )} ] > vit lor > DELETE\n`,
          "farm"
        );
        listDucks = listDucks.filter((d) => d.id !== duck.id);
        await sleep(config.sleepTime);
        collectFromList(token, ua, listNests, listDucks);
      } else {
        await sleep(eggToHatch.data.time_remain);
        const duckCollected = await collectDuck(token, ua, listNests[0].id);
        // console.log("duckCollected", duckCollected.data);

        if (duckCollected.data.total_rare < maxRareDuck) {
          const duckRemoved = await removeDuck(
            token,
            ua,
            duckCollected.data.duck_id
          );
          // console.log("duckRemoved", duckRemoved);
          console.log(
            `[ NEST 🌕 ${listNests[0].id} ] : [ DUCK 🦆 ${
              duckCollected.data.duck_id
            } ] : [ ${showRareDuck(duckCollected.data)} ] > vit lor > DELETE`
          );
          await sleep(config.sleepTime);
        } else {
          // listDucks.push(duckCollected.data);
          console.log(
            `Da thu hoach [ DUCK 🦆 ${
              duckCollected.data.duck_id
            } ] : [ ${showRareDuck(duckCollected.data)} ]`
          );
          addLog(
            `Da thu hoach [ DUCK 🦆 ${
              duckCollected.data.duck_id
            } ] : [ ${showRareDuck(duckCollected.data)} ]\n`,
            "farm"
          );
          await sleep(config.sleepTime);
        }

        const duck = getDuckToLay(listDucks);
        // console.log("duckToLay", duck);
        await layEgg(token, ua, listNests[0].id, duck.id);
        listNests.shift();
        listDucks = listDucks.filter((d) => d.id !== duck.id);

        await sleep(config.sleepTime);
        collectFromList(token, ua, listNests, listDucks);
      }
    } else {
      const { data } = await collectEgg(token, ua, listNests[0].id);
      // console.log(data);
      // console.log(listNests[0]);
      if (data.error_code === "") {
        const duck = getDuckToLay(listDucks);
        await layEgg(token, ua, listNests[0].id, duck.id);
        console.log(
          `Da thu hoach [ NEST 🌕 ${listNests[0].id} ] : [ EGG 🥚 ${
            RARE_EGG[listNests[0].type_egg]
          } ]`
        );
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
          hatchEggGoldenDuck(token);
        }
      }
    }
  }
}

async function hatchEggGoldenDuck(token) {
  try {
    accessToken = token;

    if (!run) {
      timerInstance.start();
      maxDuckSlot = await getMaxDuck(accessToken, ua);
      // console.log(maxDuckSlot);
      maxDuckSlot = maxDuckSlot.data.max_duck;
    }
    console.log("[ GOLDEN DUCK AND HATCH MODE ]");
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
          addLog(
            "[ GOLDEN DUCK 🐥 ] : Chuc ban may man lan sau\n",
            "goldenDuck"
          );
        } else if (rewardData.data.type === 1 || rewardData.data.type === 4) {
          console.log("[ GOLDEN DUCK 🐥 ] : TON | TRU > SKIP");
          addLog("[ GOLDEN DUCK 🐥 ] : TON | TRU > SKIP\n", "goldenDuck");
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

    const { listNests, listDucks } = await getListReload(
      accessToken,
      ua,
      run ? false : true
    );

    if (!run) {
      maxRareEgg = calculatorRareEgg(listNests.length);
      // console.log("maxRareEgg", maxRareEgg);

      const duck = listDucks.reduce((prev, curr) =>
        prev.total_rare > curr.total_rare ? prev : curr
      );
      maxRareDuck = duck.total_rare;
      // console.log("maxRareDuck", maxRareDuck);
    }

    run = true;
    const nestIds = listNests.map((i) => i.id);
    console.log(`[ ${listNests.length} NEST 🌕 ] :`, nestIds);
    console.log();
    collectFromList(accessToken, ua, listNests, listDucks);
  } catch (error) {
    console.log("hatchEggGoldenDuck error", error);
  }
}

module.exports = hatchEggGoldenDuck;
