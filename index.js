#!/bin/env node

const Bot = require("./src/bot");
const { dbref, password, token, esPort, prefix } = require("./config");

const bot = new Bot({ dbref, password, token, esPort, prefix });
bot.start();
