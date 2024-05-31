const getAction = require("../actions/get");
const postAction = require("../actions/post");
const addLog = require("../modules/addLog");
const sleep = require("../modules/sleep");
const config = require("../config.json");

async function getInfo(token, ua) {
  try {
    const { data } = await getAction(token, "golden-duck/info", ua);
    // console.log("goldenDuckInfo", data);
    const time = data.data.time_to_golden_duck;
    // console.log(time);
    if (time === 0) {
      console.log(`[ GOLDEN DUCK 🐥 ] : Zit Zang xuat hien`);
      await sleep(3);
      getReward(token, ua);
    } else {
      console.log(
        `[ GOLDEN DUCK 🐥 ] : ${Number((time + 1) / 60).toFixed(
          0
        )} phut nua gap`
      );
      await sleep(time + 1);
      goldenDuck(token, ua);
    }
  } catch (error) {
    console.log("goldenDuckInfo error");
    if (error.response) {
      // console.log(error.response.data);
      console.log("status", error.response.status);
      // console.log(error.response.headers);
    } else if (error.request) {
      console.log("request", error.request);
    } else {
      console.log("error", error.message);
    }
  }
}

async function getReward(token, ua) {
  try {
    const { data } = await getAction(token, "golden-duck/reward", ua);
    // console.log("goldenDuckReward", data);
    const reward = data.data;
    if (reward.type === 0) {
      console.log(`[ GOLDEN DUCK 🐥 ] : Chuc ban may man lan sau`);
      addLog(`[ GOLDEN DUCK 🐥 ] : Chuc ban may man lan sau\n`);
    } else if (reward.type === 2 || reward.type == 3) {
      claim(token, reward, ua);
    } else {
      console.log(`[ GOLDEN DUCK 🐥 ] : TON | TRU -> bo qua`);
      addLog(`[ GOLDEN DUCK 🐥 ] : TON | TRU -> bo qua\n`);
    }
  } catch (error) {
    console.log("goldenDuckReward error");
    if (error.response) {
      // console.log(error.response.data);
      console.log("status", error.response.status);
      // console.log(error.response.headers);
    } else if (error.request) {
      console.log("request", error.request);
    } else {
      console.log("error", error.message);
    }
  }
}

function getRewardInfo(data) {
  if (data.type === 1) return `${data.amount} [ TON ]`;
  if (data.type === 2) return `${data.amount} [ PEPET 🐸 ]`;
  if (data.type === 3) return `${data.amount} [ EGG 🥚 ]`;
  if (data.type === 4) return `${data.amount} [ TRU ]`;
}

async function claim(token, reward, ua) {
  try {
    const { data } = await postAction(token, "golden-duck/claim", "type=1", ua);
    // console.log("goldenDuckClaim", data);
    if (data.data) {
      const rewardInfo = getRewardInfo(reward);
      console.log(`[ GOLDEN DUCK 🐥 ] : ${rewardInfo}`);
      addLog(`[ GOLDEN DUCK 🐥 ] : ${rewardInfo}\n`);
      await sleep(config.sleepTime);
      goldenDuck(token, ua);
    }
  } catch (error) {
    console.log("goldenDuckClaim error");
    if (error.response) {
      // console.log(error.response.data);
      console.log("status", error.response.status);
      // console.log(error.response.headers);
    } else if (error.request) {
      console.log("request", error.request);
    } else {
      console.log("error", error.message);
    }
  }
}

async function goldenDuck(token, ua) {
  getInfo(token, ua);
}

module.exports = goldenDuck;
