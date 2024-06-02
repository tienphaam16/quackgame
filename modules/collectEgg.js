const postAction = require("../actions/post");
const sleep = require("./sleep");

async function collectEgg(token, ua, nest_id) {
  try {
    const { data } = await postAction(
      token,
      "nest/collect",
      "nest_id=" + nest_id,
      ua
    );
    // console.log("collectEgg", data);
    return data;
  } catch (error) {
    console.log("collectEgg error");
    if (error.response) {
      // console.log(error.response.data);
      console.log("status", error.response.status);
      console.log("data", error.response.data);
      const status = error.response.status;
      // console.log(error.response.headers);
      if (status === 503 || status === 502) {
        console.log("Mat ket noi, tu dong ket noi sau 30s");
        await sleep(30);
        collectEgg(token, ua, nest_id);
      } else if (status === 401) {
        console.log(`\nToken loi hoac het han roi\n`);
      } else if (status === 400) {
        await sleep(10);
        collectEgg(token, ua, nest_id);
      } else {
        await sleep(5);
        collectEgg(token, ua, nest_id);
      }
    } else if (error.request) {
      console.log("request", error.request);
    } else {
      console.log("error", error.message);
    }
  }
}

module.exports = collectEgg;
