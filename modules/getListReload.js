const getAction = require("../actions/get");
const config = require("../config.json");
const sleep = require("./sleep");

async function getListReload(token, ua, new_game = false) {
  try {
    return await getListReloadInternal(token, ua, new_game);
  } catch (error) {
    console.log("getListReload error");
    if (error.response) {
      // console.log(error.response.data);
      console.log("status", error.response.status);
      console.log("data", error.response.data);
      const status = error.response.status;
      // console.log(error.response.headers);
      if (status === 503 || status === 502) {
        console.log("Mat ket noi, tu dong ket noi sau 30s");
        await sleep(30);
        return await getListReloadInternal(token, ua, true);
      } else if (status === 401) {
        console.log(`\nToken loi hoac het han roi\n`);
      } else if (status === 400) {
        await sleep(10);
        return await getListReloadInternal(token, ua, true);
      } else {
        await sleep(5);
        return await getListReloadInternal(token, ua, true);
      }
    } else if (error.request) {
      console.log("request", error.request);
    } else {
      console.log("error", error.message);
    }
  }
}

async function getListReloadInternal(token, ua, new_game) {
  let listNests = [];
  let listDucks = [];

  let data = await getListReloadInternalCallAPI(token, ua, new_game);

  data.data.nest.forEach((n) => {
    if (n.type_egg) listNests.push(n);
  });

  if (listNests.length < config.nest) {
    data = await getListReloadInternalCallAPI(token, ua, true);
  } 

  listDucks = data.data.duck;

  return { listNests, listDucks };
}

async function getListReloadInternalCallAPI(token, ua, new_game = false) {
  const endpoint = new_game ? "nest/list" : "nest/list-reload";
  // console.log(new_game, endpoint);
  const { data } = await getAction(token, endpoint, ua);
  // console.log("getListReload", data);
  return data;
}

module.exports = getListReload;
