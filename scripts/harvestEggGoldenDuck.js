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
const collectDuck = require("../modules/collectDuck");
const getBalance = require("../modules/getBalance");

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
let pets = 0;
let goldenDuck = 0;
let timeToGoldenDuck = 0;
let accessToken = null;
let wallets = null;
let balanceEgg = 0;
let balancePet = 0;
let msg = null;

function getDuckToLay(ducks) {
  const duck = ducks.reduce((prev, curr) =>
    prev.last_active_time < curr.last_active_time ? prev : curr
  );

  return duck;
}

async function collectFromListInternal(token, listNests, listDucks) {
  const nestStatus = listNests[0].status;
  const duck = getDuckToLay(listDucks);

  if (nestStatus === 2) {
    const collectEggData = await collectEgg(token, ua, listNests[0].id);
    // console.log("collectEggData", collectEggData);

    if (collectEggData.error_code !== "") {
      const error_code = collectEggData.error_code;
      console.log("collectEggData error", error_code);

      switch (error_code) {
        case "DUPLICATE_REQUEST":
          await sleep(config.sleepTime);
          collectFromList(token, listNests, listDucks);
          break;
        case "THIS_NEST_DONT_HAVE_EGG_AVAILABLE":
          const layEggData = await layEgg(token, ua, listNests[0].id, duck.id);

          listNests.shift();
          listDucks = listDucks.filter((d) => d.id !== duck.id);

          await sleep(config.sleepTime);
          collectFromList(token, listNests, listDucks);
          break;
        default:
          await sleep(config.sleepTime);
          harvestEggGoldenDuck(token);
          break;
      }
    } else {
      const layEggData = await layEgg(token, ua, listNests[0].id, duck.id);
      // console.log("layEggData", layEggData);

      if (layEggData.error_code !== "") {
        const error_code = layEggData.error_code;
        console.log("layEggData error", error_code);

        switch (error_code) {
          case "THIS_DUCK_NOT_ENOUGH_TIME_TO_LAY":
            await sleep(config.sleepTime);
            collectFromList(token, listNests, listDucks);
            break;
          case "THIS_NEST_IS_UNAVAILABLE":
            await sleep(config.sleepTime);
            harvestEggGoldenDuck(token);
            break;
          default:
            await sleep(config.sleepTime);
            harvestEggGoldenDuck(token);
            break;
        }
      } else {
        const rareEgg = RARE_EGG[listNests[0].type_egg];
        msg = `Da thu hoach [ NEST 🌕 ${listNests[0].id} ] : [ EGG 🥚 ${rareEgg} ]`;
        console.log(msg);

        balanceEgg++;

        eggs++;
        listNests.shift();
        listDucks = listDucks.filter((d) => d.id !== duck.id);

        await sleep(config.sleepTime);
        collectFromList(token, listNests, listDucks);
      }
    }
  } else if (nestStatus === 3) {
    console.log(
      `[ NEST 🌕 ${listNests[0].id} ] dang ap trung > tu dong thu hoach vit de tiep tuc`
    );
    const collectDuckData = await collectDuck(token, ua, listNests[0].id);

    const duck = getDuckToLay(listDucks);
    const layEggData = await layEgg(token, ua, listNests[0].id, duck.id);

    listNests.shift();
    listDucks = listDucks.filter((d) => d.id !== duck.id);

    await sleep(config.sleepTime);
    harvestEggGoldenDuck(token);
  } else {
    console.log(listNests[0]);
    console.log("Loi nay tui chua nghi den");
    console.log(ERROR_MESSAGE);
  }
}

async function collectFromList(token, listNests, listDucks) {
  if (listNests.length === 0)
    return console.clear(), harvestEggGoldenDuck(token);
  // if (listNests.length === 0)
  //   return console.log(), harvestEggGoldenDuck(token);
  // console.log(listNests.length, listDucks.length);
  // console.log(listNests[0]);

  return collectFromListInternal(token, listNests, listDucks);
}

async function harvestEggGoldenDuck(token) {
  try {
    accessToken = token;

    if (!run) {
      wallets = await getBalance(accessToken, ua);
      wallets.forEach((w) => {
        if (w.symbol === "EGG") balanceEgg = Number(w.balance);
        if (w.symbol === "PET") balancePet = Number(w.balance);
      });
      timerInstance.start();
      run = true;
    }

    console.log("[ ALL EGG AND GOLDEN DUCK MODE ]");
    console.log();
    console.log("Link Tool : [ j2c.cc/quack ]");
    console.log(`Ban dang co : [ ${balanceEgg} EGG 🥚 ] [ ${balancePet} 🐸 ]`);
    console.log();
    console.log(
      `Thoi gian chay : [ ${timerInstance
        .getTimeValues()
        .toString(["days", "hours", "minutes", "seconds"])} ]`
    );
    console.log(`Tong thu hoach : [ ${eggs} EGG 🥚 ] [ ${pets} 🐸 ]`);
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

          const data = getGoldenDuckRewardData.data;
          if (data.type === 0) {
            msg = "[ GOLDEN DUCK 🐥 ] : Chuc ban may man lan sau";
            console.log(msg);
            addLog(msg, "\n");
          } else if (data.type === 1 || data.type === 4) {
            msg = "[ GOLDEN DUCK 🐥 ] : TON | TRU > SKIP";
            console.log(msg);
            addLog(msg, "\n");
          } else {
            const claimGoldenDuckData = await claimGoldenDuck(accessToken, ua);
            // console.log("claimGoldenDuckData", claimGoldenDuckData);

            goldenDuck++;

            if (data.type === 2) {
              pets += Number();
              balancePet += Number(data.amount);
            }
            if (data.type === 3) {
              eggs += Number(data.amount);
              balanceEgg += Number(data.amount);
            }

            msg = `[ GOLDEN DUCK 🐥 ] : ${goldenDuckRewardText(data)}`;
            console.log(msg);
            addLog(msg, "\n");
          }
        } else {
          timeToGoldenDuck = getGoldenDuckInfoData.data.time_to_golden_duck;
          setInterval(() => {
            timeToGoldenDuck--;
          }, 1e3);
        }
      }
    }
    msg = `[ GOLDEN DUCK 🐥 ] : [ ${goldenDuck} 🐥 ] | ${timeToGoldenDuck}s nua gap`;
    console.log(msg);
    // console.log("timeToGoldenDuck", timeToGoldenDuck);

    const { listNests, listDucks } = await getListReload(
      accessToken,
      ua,
      run ? false : true
    );
    // console.log(listNests, listDucks);

    const nestIds = listNests.map((i) => i.id);
    console.log(`[ ${listNests.length} NEST 🌕 ] : [ ${nestIds.join(", ")} ]`);
    console.log();
    collectFromList(accessToken, listNests, listDucks);
  } catch (error) {
    console.log("harvestEggGoldenDuck error", error);
    console.log(ERROR_MESSAGE);
  }
}

module.exports = harvestEggGoldenDuck;
