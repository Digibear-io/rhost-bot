#!/user/bin/env node

const Bot = require("./src/bot");
const { dbref, password, token, tcpPort } = require("./config");

const bot = new Bot({ dbref, password, token, tcpPort });
bot.start();
