const getAction = require("../actions/get");
const sleep = require("./sleep");

async function getBalance(token, ua) {
  try {
    return await getBalanceInternal(token, ua);
  } catch (error) {
    console.log("getBalance error");
    if (error.response) {
      // console.log(error.response.data);
      console.log("status", error.response.status);
      console.log("data", error.response.data);
      const status = error.response.status;
      // console.log(error.response.headers);
      if (status === 503 || status === 502) {
        console.log("Mat ket noi, tu dong ket noi sau 30s");
        await sleep(30);
        return await getBalanceInternal(token, ua);
      } else if (status === 401) {
        console.log(`\nToken loi hoac het han roi\n`);
      } else if (status === 400) {
        await sleep(10);
        return await getBalanceInternal(token, ua);
      } else {
        await sleep(5);
        return await getBalanceInternal(token, ua);
      }
    } else if (error.request) {
      console.log("request", error.request);
    } else {
      console.log("error", error.message);
    }
  }
}

async function getBalanceInternal() {
  let wallets = [];

  const { data } = await getAction(token, "balance/get", ua);
  // console.log("getBalance", data);

  data.data.data.forEach((bl) => {
    if (bl.symbol === "PET") {
      wallets.push({
        symbol: "PET 🐸",
        balance: bl.balance,
      });
    } else if (bl.symbol === "EGG") {
      wallets.push({
        symbol: "EGG 🥚",
        balance: bl.balance,
      });
    }
  });

  return wallets;
}

module.exports = getBalance;
