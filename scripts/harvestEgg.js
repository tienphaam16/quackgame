const getBalance = require("../modules/getBalance");
const getAction = require("../actions/get");
const postAction = require("../actions/post");
const config = require("../config.json");
const sleep = require("../modules/sleep");
const Timer = require("easytimer.js").Timer;

let timerInstance = new Timer();
let run = false;
let eggs = 0;

async function getListReload(token, ua, new_game = false) {
  try {
    let listNests = [];
    let listDucks = [];

    const endpoint = new_game ? "nest/list" : "nest/list-reload";
    // console.log(config.nest, new_game, endpoint);

    const listReload = await getAction(token, endpoint, ua);
    // console.log("listReload info", listReload);

    listReload.data.data.nest.forEach((n) => {
      if (n.type_egg) listNests.push(n);
    });
    // console.log("listNests", listNests.length);

    if (listNests.length < config.nest) return getListReload(token, ua, true);

    listDucks = listReload.data.data.duck;
    // console.log("listDucks", listDucks.length);

    const nestIds = listNests.map((i) => i.id);
    console.log(`[ NEST 🌕 ${listNests.length} ] :`, nestIds);

    await sleep(config.sleepTime);
    collectFromList(token, listNests, listDucks, ua);
  } catch (error) {
    console.log("getListReload error");
    if (error.response) {
      // console.log(error.response.data);
      console.log("status", error.response.status);
      // console.log(error.response.headers);
      console.log("Thu lai sau 5s");
      await sleep(5);
      getListReload(token);
    } else if (error.request) {
      console.log("request", error.request);
    } else {
      console.log("error", error.message);
    }
  }
}

async function collectFromList(token, listNests, listDucks, ua) {
  try {
    if (listNests.length === 0) return console.clear(), harvestEgg(token, ua);

    collect(token, listNests, listDucks, ua);
  } catch (error) {
    console.log("collectFromList error", error);
  }
}

async function collect(token, listNests, listDucks, ua) {
  try {
    // console.log(listNests);
    // console.log(listDucks);
    const { data } = await postAction(
      token,
      "nest/collect",
      "nest_id=" + listNests[0].id,
      ua
    );
    // console.log("collectInfo", data);
    if (data.data) {
      await sleep(1);
      layEgg(token, listNests[0].id, listNests, listDucks, ua);
    }
  } catch (error) {
    console.log("collect error");
    if (error.response) {
      // console.log(error.response.data);
      console.log("status", error.response.status);
      // console.log("response", error.response.data);
      // console.log(error.response.headers);
      console.log("Thu lai sau 5s");
      await sleep(5);
      collect(token, listNests, listDucks);
    } else if (error.request) {
      console.log("request", error.request);
    } else {
      console.log("error", error.message);
    }
  }
}

function getDuckToLay(ducks) {
  let duck = null;
  let lastTime = Number((Date.now() / 1e3).toFixed(0));

  ducks.forEach((duck) => {
    if (duck.last_active_time < lastTime) lastTime = duck.last_active_time;
  });

  ducks.map((item) => {
    if (item.last_active_time === lastTime) duck = item;
  });

  return duck;
}

async function layEgg(token, nest_id, listNests, listDucks, ua) {
  try {
    const duck = getDuckToLay(listDucks);

    const { data } = await await postAction(
      token,
      "nest/lay-egg",
      "nest_id=" + nest_id + "&duck_id=" + duck.id,
      ua
    );
    // console.log("layEggInfo", data);

    if (data.data) {
      eggs++;
      console.log(`Da thu hoach [ NEST 🌕 ${listNests[0].id} ]`);

      listNests.shift();
      listDucks = listDucks.filter((d) => d.id !== duck.id);

      await sleep(3);
      collectFromList(token, listNests, listDucks, ua);
    }
  } catch (error) {
    console.log("layEgg error");
    if (error.response) {
      // console.log(error.response.data);
      console.log("status", error.response.status);
      // console.log("response", error.response.data);
      // console.log(error.response.headers);
      console.log("Thu lai sau 5s");
      await sleep(5);
      layEgg(token, nest_id, listNests, listDucks);
    } else if (error.request) {
      console.log("request", error.request);
    } else {
      console.log("error", error.message);
    }
  }
}

async function harvestEgg(token, ua) {
  console.clear();

  if (!run) timerInstance.start();

  console.log(
    `RUN TIME : [ ${timerInstance
      .getTimeValues()
      .toString(["days", "hours", "minutes", "seconds"])} ]`
  );
  console.log(`TONG THU HOACH : [ ${eggs} EGG 🥚]`);
  console.log("----------------------------------------------------");

  run = true;

  await getBalance(token, ua);

  getListReload(token, ua);
}

module.exports = harvestEgg;
