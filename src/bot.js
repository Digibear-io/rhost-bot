const { readdirSync } = require("fs");
const { resolve } = require("path");
const utils = require("./utils");
const Discord = require("discord.js");
const API = require("@digibear/rhost-wrapper");

class Bot {
  /**
   * Create a new Bot object
   * @param {object} options
   * @param {string} options.dbref The #dbref of the API object to
   * associate with the bot
   * @param {string} options.password  The password to access the RHost API
   * @param {string} options.token The discord token to log into the bot.
   * @param {string} options.prefix  The command prefix used for the bot.
   * @param {number} options.esPort The port to host the bot's TCP socket.
   * @param {string} [options.host] The host to connect to.
   */
  constructor({ dbref, password, token, prefix, esPort, host }) {
    this.dbref = dbref;
    this.password = password;
    this.utils = utils;
    this.token = token;
    this.client = new Discord.Client();
    this.api = new API({ user: dbref, password, encode: true });
    this.cmds = new Map();
    this.help = new Map();
    this.prefix = prefix || "!";
    this.esPort = esPort || 4950;
    this.host = host || "localhost";
  }

  /**
   * Attempt to load plugin files from a given directory.
   * @param {*} path The path to the directory.
   */
  async loadPluginDir(path) {
    // Read the directory
    const dir = readdirSync(resolve(path), {
      encoding: "utf8",
      withFileTypes: true
    });

    // Attempt to install any files found.
    for (const dirent of dir) {
      if (dirent.isFile) {
        try {
          require(path + "/" + dirent.name)(this);
        } catch (error) {
          console.error(`Couldn't load file: ${dirent.name}`);
        }
      }
    }
  }

  /**
   * Add commands to the Discord Bot.
   * @param {Object} options The options for setting a bot command
   * @param {string} options.cmd The name of the command
   * @param {(args:String[], message:any) => void} options.func The function to be run when the
   * command is entered on Discord.
   * @param {string} options.desc A few word description of the command.
   * @param {string} options.usage Shown in the help screen under the command entry.
   * Keep it short, maybe two or three words.
   * @param {string} options.roles A space seperated list of roles that
   * are authorized to use the command.
   */
  addCmd({ usage = "", cmd, func, roles = "", desc = "" }) {
    this.cmds.set(cmd.toLowerCase(), { func, roles, usage, desc });
    this.help.set(cmd, { usage, desc, roles });
  }

  processCmd(message) {
    const parts = message.content.split(" ");
    const cmd = parts
      .shift()
      .slice(this.prefix.length)
      .toLowerCase();
    // Check for commands
    // If the command matches something in the
    // command map, fire it, else return a message
    let found = false;

    this.cmds.forEach((v, k) => {
      if (cmd === k) {
        found = true;
        return v.func(parts, message);
      }
    });

    // If no command matches, send the proverbial huh? response.
    if (!found) {
      message.channel.send(utils.pre(`Huh? Use '${this.prefix}help' for help`));
    }
  }

  /**
   * Start the Discord Bot
   */
  start() {
    // Load commands
    this.loadPluginDir(resolve(__dirname, "commands"));

    // Load systems
    require("./systems/tcpserver")(this);
    require("./systems/discordclient")(this);
  }
}

module.exports = Bot;
