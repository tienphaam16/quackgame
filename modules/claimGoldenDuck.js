const postAction = require("../actions/post");
const addLog = require("./addLog");
const sleep = require("./sleep");
const config = require("../config.json");

function getRewardInfo(data) {
  if (data.type === 1) return `${data.amount} [ TON ]`;
  if (data.type === 2) return `${data.amount} [ PEPET 🐸 ]`;
  if (data.type === 3) return `${data.amount} [ EGG 🥚 ]`;
  if (data.type === 4) return `${data.amount} [ TRU ]`;
}

async function claimGoldenDuck(token, ua, reward) {
  try {
    const { data } = await postAction(token, "golden-duck/claim", "type=1", ua);
    console.log("goldenDuckClaim", data);
    if (data.data) {
      const rewardInfo = getRewardInfo(reward);
      console.log(`[ GOLDEN DUCK 🐥 ] : ${rewardInfo}`);
      addLog(`[ GOLDEN DUCK 🐥 ] : ${rewardInfo}\n`);
      await sleep(config.sleepTime);
      return data.data;
    }
  } catch (error) {
    console.log("claimGoldenDuck error");
    if (error.response) {
      // console.log(error.response.data);
      console.log("status", error.response.status);
      console.log("data", error.response.data);
      const status = error.response.status;
      // console.log(error.response.headers);
      if (status === 503 || status === 502) {
        console.log("Mat ket noi, tu dong ket noi sau 30s");
        await sleep(30);
        claimGoldenDuck(token, ua, reward);
      } else if (status === 401) {
        console.log(`\nToken loi hoac het han roi\n`);
      } else if (status === 400) {
        // await sleep(10);
        // claimGoldenDuck(token, ua, );
      } else {
        await sleep(5);
        claimGoldenDuck(token, ua, reward);
      }
    } else if (error.request) {
      console.log("request", error.request);
    } else {
      console.log("error", error.message);
    }
  }
}

module.exports = claimGoldenDuck;
