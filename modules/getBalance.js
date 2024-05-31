const getAction = require("../actions/get");

async function getBalance(token, ua) {
  try {
    let wallets = [];
    let walletStr = "";

    const balanceInfo = await getAction(token, "balance/get", ua);
    // console.log("balanceInfo", balanceInfo.data);

    balanceInfo.data.data.data.forEach((bl) => {
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

    wallets.forEach((w) => {
      walletStr += `[ ${Number(w.balance).toFixed(2)} ${w.symbol} ] `;
    });
    console.log("[ WALLETS 💰 ] :", walletStr);

    return "getBalance ok";
  } catch (error) {
    console.log("getBalance error");
    if (error.response) {
      // console.log(error.response.data);
      console.log("status", error.response.status);
      // const { status } = error.response;
      // if (status >= 500) {
      //   sleep(randomTime());
      //   getBalance(token);
      // }
      // console.log(error.response.headers);
    } else if (error.request) {
      console.log("request", error.request);
    } else {
      console.log("error", error.message);
    }
  }
}

module.exports = getBalance;
