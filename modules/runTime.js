const Timer = require("easytimer.js").Timer;

let timerInstance;

function runTime() {
  timerInstance = new Timer();
  return timerInstance;
}

module.exports = runTime;
