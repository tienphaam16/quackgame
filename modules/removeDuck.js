const postAction = require("../actions/post");
const sleep = require("./sleep");
const config = require("../config.json");

async function removeDuck(token, ua, duck_id) {
  let retry = 0;
  let data = null;
  while (retry < config.retryCount) {
    if (!!data) {
      break;
    }
    data = await removeDuckInternal(token, ua, duck_id);
    retry++;
  }

  return data;
}

async function removeDuckInternal(token, ua, duck_id) {
  try {
    const data = `ducks=%7B%22ducks%22%3A%5B${duck_id}%5D%7D`;
    const response = await postAction(token, "duck/remove", data, ua);
    // console.log(response);
    return response.data;
  } catch (error) {
    console.log("removeDuck error");
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

  return null;
}

module.exports = removeDuck;
