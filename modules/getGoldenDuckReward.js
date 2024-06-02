const getAction = require("../actions/get");
const sleep = require("./sleep");

async function getGoldenDuckReward(token, ua) {
  try {
    return await getGoldenDuckRewardInternal(token, ua);
  } catch (error) {
    console.log("getGoldenDuckReward error");
    if (error.response) {
      // console.log(error.response.data);
      console.log("status", error.response.status);
      console.log("data", error.response.data);
      const status = error.response.status;
      // console.log(error.response.headers);
      if (status === 503 || status === 502) {
        console.log("Mat ket noi, tu dong ket noi sau 30s");
        await sleep(30);
        return await getGoldenDuckRewardInternal(token, ua);
      } else if (status === 401) {
        console.log(`\nToken loi hoac het han roi\n`);
      } else if (status === 400) {
        // if (error.response.data.error_code === "NOT_ENOUGH_TIME_TO_GOLDEN_DUCK")
        //   return { error: true, messaga: "Chua toi gio dap Zit Zang" };
        // await sleep(10);
        // return await getGoldenDuckRewardInternal(token, ua);
      } else {
        await sleep(5);
        return await getGoldenDuckRewardInternal(token, ua);
      }
    } else if (error.request) {
      console.log("request", error.request);
    } else {
      console.log("error", error.message);
    }
  }
}

async function getGoldenDuckRewardInternal(token, ua) {
  const { data } = await getAction(token, "golden-duck/reward", ua);
  // console.log("getGoldenDuckReward", data);
  return data;
}

module.exports = getGoldenDuckReward;
