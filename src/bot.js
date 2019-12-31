const { readdirSync } = require("fs");
const { resolve } = require("path");
const { pre } = require("./utils");
const Discord = require("discord.js");
const API = require("@digibear/rhost-wrapper");

class Bot {
  /**
   * Create a new Bot object
   * @param {string} dbref The #dbref of the API object to
   * associate with the bot
   * @param {string} password  The password to access the RHost API
   * @param {string} token The discord token to log into the bot.
   * @param {string} prefix  The command prefix used for the bot.
   * @param {number} tcpPort The port to host the bot's TCP socket.
   */
  constructor(dbref, password, token, prefix, tcpPort) {
    this.dbref = dbref;
    this.password = password;
    this.token = token;
    this.discord = new Discord.Client();
    this.api = new API({ user, password, encode: true });
    this.cmds = new Map();
    this.prefix = prefix;
    this.tcpPort = tcpPort;
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
   * @param {(args:String[]) => void} options.func The function to be run when the
   * command is entered on Discord.
   * @param {string} options.desc A few word description of the command.
   * @param {string} options.roles A space seperated list of roles that
   * are authorized to use the command.
   */
  addCmd({ usage = "", cmd, func, roles = "", desc = "" }) {
    this.cmds.set(cmd.toLowerCase(), { func, roles, usage, desc });
  }

  /**
   * Start the Discord Bot
   */
  start() {
    this.discord.on("ready", () =>
      console.log(`Bot connected as: ${this.discord.user.tag}`)
    );

    this.discord.on("message", message => {
      const parts = message.content.split(" ");
      const cmd = parts
        .shift()
        .slice(1)
        .toLowerCase();

      const args = parts;

      // Check for commands
      if (message.content.startsWith(`${prefix}`)) {
        // If the command matches something in the
        // command map, fire it, else return a message
        this.cmds.forEach((v, k) => {
          if (cmd === k) {
            return v.func(args, message);
          }

          // If no command matches, send the proverbial huh? response.
          message.channel.send(pre(`Huh? Use '${prefix}help' for help`));
        });
      }
    });

    this.discord.login(this.token);
  }
}

module.exports = Bot;
