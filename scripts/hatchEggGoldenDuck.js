const getListReload = require("../modules/getListReload");
const collectEgg = require("../modules/collectEgg");
const layEgg = require("../modules/layEgg");
const getGoldenDuckInfo = require("../modules/getGoldenDuckInfo");
const getGoldenDuckReward = require("../modules/getGoldenDuckReward");
const claimGoldenDuck = require("../modules/claimGoldenDuck");
const addLog = require("../modules/addLog");
const getMaxDuck = require("../modules/getMaxDuck");
const collectDuck = require("../modules/collectDuck");
const removeDuck = require("../modules/removeDuck");
const goldenDuckRewardText = require("../modules/goldenDuckRewardText");
const getBalance = require("../modules/getBalance");
const Timer = require("easytimer.js").Timer;
const randomUseragent = require("random-useragent");
const hatchEgg = require("../modules/hatchEgg");
const randomSleep = require("../modules/randomSleep");
const sleep = require("../modules/sleep");

const ua = randomUseragent.getRandom((ua) => {
  return ua.browserName === "Chrome";
});
// console.log(ua);

const ERROR_MESSAGE = "Chup man hinh va tao issue Github de tui tim cach fix";

const RARE_EGG = [
  undefined,
  "Common *",
  "Common **",
  "Rare *",
  "Rare **",
  "Rare ***",
  "Rare ****",
  "Rare *****",
  "Rare ******",
  "Mythic *",
  "Mythic **",
  "Mythic ***",
  "Mythic ****",
  "Eternal",
];

const RARE_DUCK = [undefined, "COMMON", "RARE", "LEGENDARY"];

let accessToken = null;
let run = false;
let timerInstance = new Timer();
let eggs = 0;
let pepet = 0;
let goldenDuck = 0;
let timeToGoldenDuck = 0;
let myInterval = null;
let maxDuckSlot = null;
let maxRareEgg = null;
let maxRareDuck = null;
let msg = null;
let wallets = null;
let balancePet = 0;
let balanceEgg = 0;

function showRareDuck(metadata) {
  return [
    RARE_DUCK[metadata.head_rare],
    RARE_DUCK[metadata.arm_rare],
    RARE_DUCK[metadata.body_rare],
  ].join(", ");
}

function getDuckToLay(ducks) {
  // console.log(ducks);
  const duck = ducks.reduce((prev, curr) =>
    prev.last_active_time < curr.last_active_time ? prev : curr
  );
  return duck;
}

async function collectFromListInternal(token, listNests, listDucks) {
  const randomIndex = Math.floor(Math.random() * listNests.length);
  // console.log(randomIndex);
  const nest = listNests[randomIndex];
  // console.log(nest);
  const nestStatus = nest.status;
  const duck = getDuckToLay(listDucks);
  // console.log(duck);

  if (nestStatus === 2) {
    if (nest.type_egg < maxRareEgg) {
      const collectEggData = await collectEgg(token, ua, nest.id);
      // console.log("collectEggData", collectEggData);

      if (collectEggData.error_code !== "") {
        const error_code = collectEggData.error_code;
        console.log("collectEggData error", error_code);

        switch (error_code) {
          case "DUPLICATE_REQUEST":
            console.log("this error was fixed");
            await randomSleep();
            collectFromList(token, listNests, listDucks);
            break;
          case "THIS_NEST_DONT_HAVE_EGG_AVAILABLE":
            console.log("this error was fixed");
            const layEggData = await layEgg(token, ua, nest.id, duck.id);

            listNests = listNests.filter((n) => n.id !== nest.id);
            listDucks = listDucks.filter((d) => d.id !== duck.id);

            await randomSleep();
            collectFromList(token, listNests, listDucks);
            break;
          default:
            console.log(ERROR_MESSAGE);
            await randomSleep();
            hatchEggGoldenDuck(token);
            break;
        }
      } else {
        const layEggData = await layEgg(token, ua, nest.id, duck.id);
        // console.log("layEggData", layEggData);

        if (layEggData.error_code !== "") {
          const error_code = layEggData.error_code;
          console.log("layEggData error", error_code);

          switch (error_code) {
            case "THIS_DUCK_NOT_ENOUGH_TIME_TO_LAY":
              console.log("this error was fixed");
              await randomSleep();
              collectFromList(token, listNests, listDucks);
              break;

            case "THIS_NEST_IS_UNAVAILABLE":
              console.log("this error was fixed");
              await randomSleep();
              hatchEggGoldenDuck(token);
              break;

            default:
              await randomSleep();
              hatchEggGoldenDuck(token);
              break;
          }
        } else {
          const rareEgg = RARE_EGG[nest.type_egg];
          msg = `Da thu hoach [ NEST 🌕 ${nest.id} ] : [ EGG 🥚 ${rareEgg} ]`;
          console.log(msg);

          balanceEgg++;
          eggs++;

          listNests = listNests.filter((n) => n.id !== nest.id);
          listDucks = listDucks.filter((d) => d.id !== duck.id);

          await randomSleep();
          collectFromList(token, listNests, listDucks);
        }
      }
    } else {
      msg = `Dang ap trung [ NEST 🌕 ${nest.id} ] : [ EGG 🥚 ${
        RARE_EGG[nest.type_egg]
      } ]`;
      console.log(msg);

      const hatchEggData = await hatchEgg(token, ua, nest.id);
      // console.log("hatchEggData", hatchEggData);

      if (hatchEggData.error_code !== "") {
        const error_code = hatchEggData.error_code;

        switch (error_code) {
          case "REACH_MAX_NUMBER_OF_DUCK":
            const rmDuck = listDucks.reduce((prev, curr) =>
              prev.total_rare < curr.total_rare ? prev : curr
            );
            // console.log(duck);

            const removeDuckData = await removeDuck(token, ua, rmDuck.id);
            // console.log("removeDuckData", removeDuckData);

            msg = `FARM [ DUCK 🦆 ${rmDuck.id} : ${showRareDuck(
              rmDuck.metadata
            )} ] > DELETE`;
            console.log(msg);
            addLog(msg, "farm");

            listDucks = listDucks.filter((d) => d.id !== rmDuck.id);
            collectFromList(token, listNests, listDucks);
            break;

          case "THIS_NEST_DONT_HAVE_EGG_AVAILABLE":
            const layEggData = await layEgg(token, ua, nest.id, duck.id);

            listNests = listNests.filter((n) => n.id !== nest.id);
            listDucks = listDucks.filter((d) => d.id !== duck.id);

            await randomSleep();
            collectFromList(token, listNests, listDucks);
            break;

          default:
            console.log("hatchEggData error", error_code);
            console.log(ERROR_MESSAGE);
            break;
        }
      } else {
        await sleep(hatchEggData.data.time_remain);
        const collectDuckData = await collectDuck(token, ua, nest.id);
        // console.log("collectDuckData", collectDuckData);

        if (collectDuckData.error_code !== "") {
          console.log(
            "collectDuckData status 2 error",
            collectDuckData.error_code
          );
          console.log(ERROR_MESSAGE);
          const error_code = collectDuckData.error_code;

          switch (error_code) {
            case "THIS_NEST_DONT_HAVE_EGG_AVAILABLE":
              const layEggData = await layEgg(token, ua, nest.id, duck.id);

              if (layEggData.error_code !== "") {
                console.log("layEggData error", layEggData.error_code);
              } else {
                listNests = listNests.filter((n) => n.id !== nest.id);
                listDucks = listDucks.filter((d) => d.id !== duck.id);

                await randomSleep();
                collectFromList(token, listNests, listDucks);
              }
              break;
            default:
              break;
          }
        } else {
          let isDeleted = false;

          if (collectDuckData.data.total_rare < maxRareDuck) {
            const removeDuckData = await removeDuck(
              token,
              ua,
              collectDuckData.data.duck_id
            );
            // console.log("removeDuckData", removeDuckData);

            if (removeDuckData.error_code !== "") {
              console.log(
                "removeDuckData status 2.2 error",
                removeDuckData.error_code
              );
              console.log(ERROR_MESSAGE);
            }

            isDeleted = true;
          } else isDeleted = false;

          msg = `[ NEST 🌕 ${nest.id} ] : [ EGG 🥚 ${
            RARE_EGG[nest.type_egg]
          } ] : [ DUCK 🦆 ${collectDuckData.data.duck_id} : ${showRareDuck(
            collectDuckData.data.metadata
          )} ]${isDeleted ? " > DELETE" : ""}`;
          console.log(msg);
          if (!isDeleted) addLog(msg, "farm");

          const duck = getDuckToLay(listDucks);
          const layEggData = await layEgg(token, ua, nest.id, duck.id);
          // console.log("layEggData", layEggData);

          if (layEggData.error_code !== "") {
            console.log("layEggData error", layEggData.error_code);
          } else {
            listNests = listNests.filter((n) => n.id !== nest.id);
            listDucks = listDucks.filter((d) => d.id !== duck.id);

            await randomSleep();
            collectFromList(token, listNests, listDucks);
          }
        }
      }
    }
  } else if (nestStatus === 3) {
    console.log(
      `[ NEST 🌕 ${nest.id} ] dang ap trung > tu dong thu hoach vit de tiep tuc`
    );
    const collectDuckData = await collectDuck(token, ua, nest.id);
    const layEggData = await layEgg(token, ua, nest.id, duck.id);

    listNests = listNests.filter((n) => n.id !== nest.id);
    listDucks = listDucks.filter((d) => d.id !== duck.id);

    await randomSleep();
    collectFromList(token, listNests, listDucks);
  }
}

async function collectFromList(token, listNests, listDucks) {
  if (timeToGoldenDuck <= 0) {
    clearInterval(myInterval);
    myInterval = null;
    hatchEggGoldenDuck(token);
  } else {
    if (listNests.length === 0)
      return console.clear(), hatchEggGoldenDuck(token);
    // if (listNests.length === 0)
    //   return console.log(), hatchEggGoldenDuck(token);
    // console.log(listNests.length, listDucks.length);

    return collectFromListInternal(token, listNests, listDucks);
  }
}

async function hatchEggGoldenDuck(token) {
  accessToken = token;

  if (!run) {
    wallets = await getBalance(accessToken, ua);
    wallets.forEach((w) => {
      if (w.symbol === "EGG") balanceEgg = Number(w.balance);
      if (w.symbol === "PET") balancePet = Number(w.balance);
    });

    timerInstance.start();
    maxDuckSlot = await getMaxDuck(accessToken, ua);
    // console.log(maxDuckSlot);
    maxDuckSlot = maxDuckSlot.data.max_duck;
  }
  console.log("[ GOLDEN DUCK AND HATCH MODE ]");
  console.log();
  console.log("Link Tool : [ j2c.cc/quack ]");
  console.log(`Ban dang co : [ ${balanceEgg} EGG 🥚 ] [ ${balancePet} 🐸 ]`);
  console.log(
    `Thoi gian chay : [ ${timerInstance
      .getTimeValues()
      .toString(["days", "hours", "minutes", "seconds"])} ]`
  );
  console.log(`Tong thu hoach : [ ${eggs} EGG 🥚 ] [ ${pepet} 🐸 ]`);
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

        const data = getGoldenDuckRewardData;

        if (data.data.type === 0) {
          msg = "[ GOLDEN DUCK 🐥 ] : Chuc ban may man lan sau";
          console.log(msg);
          addLog(msg, "golden");
        } else if (data.data.type === 1 || data.data.type === 4) {
          msg = "[ GOLDEN DUCK 🐥 ] : TON | TRU > SKIP";
          console.log(msg);
          addLog(msg, "golden");
        } else {
          const claimGoldenDuckData = await claimGoldenDuck(accessToken, ua);
          // console.log("claimGoldenDuckData", claimGoldenDuckData);

          goldenDuck++;

          if (data.data.type === 2) {
            pepet += Number(data.data.amount);
            balancePet += Number(data.data.amount);
          }
          if (data.data.type === 3) {
            eggs += Number(data.data.amount);
            balanceEgg += Number(data.data.amount);
          }

          msg = `[ GOLDEN DUCK 🐥 ] : ${goldenDuckRewardText(data.data)}`;
          console.log(msg);
          addLog(msg, "golden");
        }
      } else {
        timeToGoldenDuck = getGoldenDuckInfoData.data.time_to_golden_duck;

        myInterval = setInterval(() => {
          timeToGoldenDuck--;
        }, 1e3);
      }
    }
  }

  msg = `[ GOLDEN DUCK 🐥 ] : [ ${goldenDuck} 🐥 ] | ${timeToGoldenDuck}s nua gap`;
  console.log(msg);

  const { listNests, listDucks } = await getListReload(
    accessToken,
    ua,
    run ? false : true
  );

  if (!run) {
    maxRareEgg = listNests.length - 1;
    // console.log("maxRareEgg", maxRareEgg);

    const duck = listDucks.reduce((prev, curr) =>
      prev.total_rare > curr.total_rare ? prev : curr
    );
    maxRareDuck = duck.total_rare;
    // console.log("maxRareDuck", maxRareDuck);
  }

  run = true;
  const nestIds = listNests.map((i) => i.id);
  console.log(`[ ${listNests.length} NEST 🌕 ] : [ ${nestIds.join(", ")} ]`);
  console.log();
  collectFromList(accessToken, listNests, listDucks);
}

module.exports = hatchEggGoldenDuck;
