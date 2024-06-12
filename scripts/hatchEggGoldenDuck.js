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
const goldenDuckRewardText = require("../modules/goldenDuckRewardText");

const ERROR_MESSAGE = "Chup man hinh va tao issue Github de tui tim cach fix";

let accessToken = null;
let run = false;
let timerInstance = new Timer();
let eggs = 0;
let pepet = 0;
let timeToGoldenDuck = 0;
let maxDuckSlot = null;
let maxRareEgg = null;
let maxRareDuck = null;

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

async function collectFromList(token, listNests, listDucks) {
  if (listNests.length === 0) return console.clear(), hatchEggGoldenDuck(token);
  // if (listNests.length === 0) return console.log(), hatchEggGoldenDuck(token);
  // console.log("maxRareEgg", maxRareEgg);
  // console.log("maxRareDuck", maxRareDuck);
  // console.log(listNests[0]);

  const status = listNests[0].status;
  // console.log(status);

  if (status === 2) {
    if (listNests[0].type_egg < maxRareEgg) {
      const collectEggData = await collectEgg(token, ua, listNests[0].id);
      // console.log("collectEggData", collectEggData);

      if (collectEggData.error_code !== "") {
        console.log("collectEggData status 2 error", collectEggData.error_code);
        console.log(ERROR_MESSAGE);
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

          await sleep(config.sleepTime);
          collectFromList(token, listNests, listDucks);
        }
      }
    } else {
      console.log(
        `Dang ap trung [ NEST 🌕 ${listNests[0].id} ] : [ EGG 🥚 ${
          RARE_EGG[listNests[0].type_egg]
        } ]`
      );

      const hatchEggData = await hatchEgg(token, ua, listNests[0].id);
      // console.log("hatchEggData", hatchEggData);

      if (hatchEggData.error_code !== "") {
        if (hatchEggData.error_code === "REACH_MAX_NUMBER_OF_DUCK") {
          const duck = listDucks.reduce((prev, curr) =>
            prev.total_rare < curr.total_rare ? prev : curr
          );
          // console.log(duck);

          const removeDuckData = await removeDuck(token, ua, duck.id);
          // console.log("removeDuckData", removeDuckData);
          if (removeDuckData.error_code !== "") {
            console.log(
              "removeDuckData status 2.1 error",
              removeDuckData.error_code
            );
            console.log(ERROR_MESSAGE);
          } else {
            console.log(
              `FARM [ DUCK 🦆 ${duck.id} : ${showRareDuck(
                duck.metadata
              )} ] > DELETE`
            );
            addLog(
              `FARM [ DUCK 🦆 ${duck.id} : ${showRareDuck(
                duck.metadata
              )} ] > DELETE\n`,
              "farm"
            );

            listDucks = listDucks.filter((d) => d.id !== duck.id);
            collectFromList(token, listNests, listDucks);
          }
        } else {
          console.log("hatchEggData error", hatchEggData.error_code);
          console.log(ERROR_MESSAGE);
        }
      } else {
        await sleep(hatchEggData.data.time_remain);
        const collectDuckData = await collectDuck(token, ua, listNests[0].id);
        // console.log("collectDuckData", collectDuckData);

        if (collectDuckData.error_code !== "") {
          console.log(
            "collectDuckData status 2 error",
            collectDuckData.error_code
          );
          console.log(ERROR_MESSAGE);
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

          console.log(
            `[ NEST 🌕 ${listNests[0].id} ] : [ EGG 🥚 ${
              RARE_EGG[listNests[0].type_egg]
            } ] : [ DUCK 🦆 ${collectDuckData.data.duck_id} : ${showRareDuck(
              collectDuckData.data.metadata
            )} ] ${isDeleted ? "> DELETE" : ""}`
          );
          if (!isDeleted)
            addLog(
              `[ NEST 🌕 ${listNests[0].id} ] : [ EGG 🥚 ${
                RARE_EGG[listNests[0].type_egg]
              } ] : [ DUCK 🦆 ${collectDuckData.data.duck_id} : ${showRareDuck(
                collectDuckData.data.metadata
              )} ] ${isDeleted ? "> DELETE" : ""}\n`,
              "farm"
            );

          const duck = getDuckToLay(listDucks);
          const layEggData = await layEgg(token, ua, listNests[0].id, duck.id);
          // console.log("layEggData", layEggData);

          if (layEggData.error_code !== "") {
            console.log("layEggData status 2 error", layEggData.error_code);
            console.log(ERROR_MESSAGE);
          } else {
            listNests.shift();
            listDucks = listDucks.filter((d) => d.id !== duck.id);

            await sleep(config.sleepTime);
            collectFromList(token, listNests, listDucks);
          }
        }
      }
    }
  } else if (status === 3) {
    const collectDuckData = await collectDuck(token, ua, listNests[0].id);
    // console.log("collectDuckData", collectDuckData);

    if (collectDuckData.error_code !== "") {
      console.log("collectDuckData status 3 error", collectDuckData.error_code);
      console.log(ERROR_MESSAGE);
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
            "removeDuckData status 3 error",
            removeDuckData.error_code
          );
          console.log(ERROR_MESSAGE);
        }

        isDeleted = true;
      } else isDeleted = false;

      console.log(
        `[ NEST 🌕 ${listNests[0].id} ] : [ EGG 🥚 ${
          RARE_EGG[listNests[0].type_egg]
        } ] : [ DUCK 🦆 ${collectDuckData.data.duck_id} : ${showRareDuck(
          collectDuckData.data.metadata
        )} ] ${isDeleted ? "> DELETE" : ""}`
      );
      addLog(
        `[ NEST 🌕 ${listNests[0].id} ] : [ EGG 🥚 ${
          RARE_EGG[listNests[0].type_egg]
        } ] : [ DUCK 🦆 ${collectDuckData.data.duck_id} : ${showRareDuck(
          collectDuckData.data.metadata
        )} ] ${isDeleted ? "> DELETE" : ""}\n`,
        "farm"
      );

      const duck = getDuckToLay(listDucks);
      const layEggData = await layEgg(token, ua, listNests[0].id, duck.id);
      // console.log("layEggData", layEggData);

      if (layEggData.error_code !== "") {
        console.log("layEggData status 3 error", layEggData.error_code);
      } else {
        listNests.shift();
        listDucks = listDucks.filter((d) => d.id !== duck.id);

        await sleep(config.sleepTime);
        collectFromList(token, listNests, listDucks);
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
                ua
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
    console.log(`[ ${listNests.length} NEST 🌕 ] :`, nestIds);
    console.log();
    collectFromList(accessToken, listNests, listDucks);
  } catch (error) {
    console.log("hatchEggGoldenDuck error", error);
  }
}

module.exports = hatchEggGoldenDuck;
