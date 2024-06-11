const fs = require("fs");

const folderName = "logs";

try {
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  }
} catch (err) {
  console.error(err);
}

function addLog(msg, type) {
  const logDate = `${new Date().getDate()}_${
    new Date().getMonth() + 1
  }_${new Date().getFullYear()}`;
  const goldDuckLog = `goldenDuck_log`;
  const farmLog = `farm_log`;

  const filename =
    type === "farm"
      ? `${farmLog}_${logDate}.txt`
      : `${goldDuckLog}_${logDate}.txt`;

  const time = new Date().toLocaleTimeString();
  const logStr = `${time} | ${msg}\n`;
  fs.appendFileSync(`./${folderName}/${filename}`, logStr, "utf-8");
}

module.exports = addLog;
