const fs = require("fs");

function addLog(msg, type) {
  const time = new Date().toLocaleString();
  const logStr = `${time} | ${msg}`;
  const filename = type === "farm" ? "farm.txt" : "goldenDuck.txt";
  fs.appendFileSync(filename, logStr, "utf-8");
}

module.exports = addLog;
