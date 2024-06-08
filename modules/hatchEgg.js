const postAction = require("../actions/post");
const sleep = require("./sleep");
const config = require("../config.json");

async function hatchEgg(token, ua, nest_id) {
  let retry = 0;
  let data = null;
  while (retry < config.retryCount) {
    if (!!data) {
      break;
    }
    data = await hatchEggInternal(token, ua, nest_id);
    retry++;
  }

  return data;
}

async function hatchEggInternal(token, ua, nest_id) {
  try {
    const response = await postAction(
      token,
      "nest/hatch",
      "nest_id=" + nest_id,
      ua
    );
    // console.log(response);
    return response.data;
  } catch (error) {
    console.log("hatchEgg error");
    if (error.response) {
      // console.log(error.response.data);
      console.log("status", error.response.status);
      // console.log("data", error.response.data);
      const status = error.response.status;
      // console.log(error.response.headers);
      if (status === 503 || status === 502 || status === 504) {
        console.log("Mat ket noi, tu dong ket noi sau 30s");
        await sleep(30);
        return null;
      } else if (status === 401) {
        console.log(`\nToken loi hoac het han roi\n`);
        process.exit(1);
      } else if (status === 400) {
        console.log("data", error.response.data);
        if (error.response.data.error_code === "REACH_MAX_NUMBER_OF_DUCK") {
          return error.response.data;
        } else {
          console.log("Mat ket noi, tu dong ket noi sau 3s");
          await sleep(3);
          return null;
        }
      } else {
        await sleep(3);
        return null;
      }
    } else if (error.request) {
      console.log("request", error.request);
    } else {
      console.log("error", error.message);
    }
  }

  return null;
}

module.exports = hatchEgg;
