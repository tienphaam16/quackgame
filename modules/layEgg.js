const postAction = require("../actions/post");
const sleep = require("./sleep");
const config = require("../config.json");

async function layEgg(token, ua, nest_id, duck_id) {
  let retry = 0;
  let data = null;
  while (retry < config.retryCount) {
    if (!!data) {
      break;
    }
    data = await layEggInternal(token, ua, nest_id, duck_id);
    retry++;
  }

  return data;
}

async function layEggInternal(token, ua, nest_id, duck_id) {
  // console.log(nest_id, duck_id);
  try {
    const response = await postAction(
      token,
      "nest/lay-egg",
      "nest_id=" + nest_id + "&duck_id=" + duck_id,
      ua
    );
    return response.data;
  } catch (error) {
    console.log("layEgg error");
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
        return error.response.data;
      } else {
        console.log("Mat ket noi, tu dong ket noi sau 3s");
        await sleep(3);
        return null;
      }
    } else if (error.request) {
      console.log("request", error.request);
      console.log("Mat ket noi, tu dong ket noi sau 30s");
      await sleep(30);
    } else {
      console.log("error", error.message);
      console.log("Mat ket noi, tu dong ket noi sau 30s");
      await sleep(30);
    }
  }
}

module.exports = layEgg;
