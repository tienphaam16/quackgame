const postAction = require("../actions/post");
const addLog = require("./addLog");
const sleep = require("./sleep");
const config = require("../config.json");

function getRewardInfo(data) {
  if (data.type === 1) return `[ ${data.amount} TON ]`;
  if (data.type === 2) return `[ ${data.amount} PEPET 🐸 ]`;
  if (data.type === 3) return `[ ${data.amount} EGG 🥚 ]`;
  if (data.type === 4) return `[ ${data.amount} TRU ]`;
}

async function claimGoldenDuck(token, ua, reward) {
  let retry = 0;
  let data = null;
  while (retry < config.retryCount) {
    if (!!data) {
      break;
    }
    data = await claimGoldenDuckInternal(token, ua, reward);
    retry++;
  }

  return data;
}

async function claimGoldenDuckInternal(token, ua, reward) {
  try {
    const response = await postAction(token, "golden-duck/claim", "type=1", ua);
    // console.log("goldenDuckClaim", data);
    if (response.data.data) {
      const rewardInfo = getRewardInfo(reward);
      console.log(`[ GOLDEN DUCK 🐥 ] : ${rewardInfo}`);
      addLog(`[ GOLDEN DUCK 🐥 ] : ${rewardInfo}\n`);
      await sleep(config.sleepTime);
      return data.data;
    } else {
      console.log("Lum ZIT ZANG that bai");
      addLog("Lum ZIT ZANG that bai\n");
      return null;
    }
  } catch (error) {
    console.log("claimGoldenDuck error");
    if (error.response) {
      // console.log(error.response.data);
      console.log("status", error.response.status);
      // console.log("data", error.response.data);
      const status = error.response.status;
      // console.log(error.response.headers);
      if (status >= 500) {
        console.log("Mat ket noi, tu dong ket noi sau 30s");
        await sleep(30);
        return null;
      } else if (status === 401) {
        console.log(`\nToken loi hoac het han roi\n`);
        process.exit(1);
      } else if (status === 400) {
        console.log("data", error.response.data);
        console.log("Mat ket noi, tu dong ket noi sau 3s");
        await sleep(3);
        return null;
      } else {
        console.log("Mat ket noi, tu dong ket noi sau 3s");
        await sleep(3);
        return null;
      }
    } else if (error.request) {
      console.log("request", error.request);
      console.log("Mat ket noi, tu dong ket noi sau 30s");
      await sleep(30);
      return null;
    } else {
      console.log("error", error.message);
      console.log("Mat ket noi, tu dong ket noi sau 30s");
      await sleep(30);
      return null;
    }
  }

  return null;
}

module.exports = claimGoldenDuck;
