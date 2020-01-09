#!/bin/env node

const Bot = require("./src/bot");
const { dbref, password, token, esPort } = require("./config");

const bot = new Bot({ dbref, password, token, esPort, robot: true });
bot.start();
