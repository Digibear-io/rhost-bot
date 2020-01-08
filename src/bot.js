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
   * @param {number} options.tcpPort The port to host the bot's TCP socket.
   */
  constructor({ dbref, password, token, prefix, tcpPort }) {
    this.dbref = dbref;
    this.password = password;
    this.utils = utils;
    this.token = token;
    this.client = new Discord.Client();
    this.api = new API({ user: dbref, password, encode: true });
    this.cmds = new Map();
    this.help = new Map();
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

  /**
   * Format a chat message.
   * @param {Object} message
   */
  _formatChat(message) {
    let chatMes = message.content;
    let chatText = "";
    let user = message.member.displayName;

    if (chatMes.startsWith(":")) {
      chatText += `${user} ${chatMes.slice(1)}`;
    } else if (chatMes.startsWith(";")) {
      chatText += `${user}${chatMes.slice(1)}`;
    } else if (chatMes.startsWith('"') || chatMes.startsWith("'")) {
      chatText += `${user} says, "${chatMes.slice(1)}"`;
    } else {
      chatText += `${user} says, "${chatMes}"`;
    }

    return chatText;
  }

  _processCmd(message) {
    const parts = message.content.split(" ");
    const cmd = parts
      .shift()
      .slice(1)
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
    // Configure the TCP server.
    const server = require("net").createServer(socket => {
      socket.on("connect", () => console.log("New connection!"));
      socket.on("data", buff => {
        const chan = this.client.channels.find(val => val.name === "mush");
        chan.send(utils.pre("[Discord] " + buff.toString()));
      });
    });

    this.client.on("ready", () =>
      console.log(`Rhost Bot connected as: ${this.client.user.tag}`)
    );

    this.client.on("message", message => {
      if (
        // Make sure it's a channel message, but not a command.
        // Or output from Rhost-Bot.
        message.channel.name === "mush" &&
        !message.content.startsWith(this.prefix) &&
        !message.content.startsWith("```")
      ) {
        const encodedMes = Base64.encode(this._formatChat(message));
        message.channel.send(
          utils.pre("[Discord] " + this._formatChat(message))
        );
        this.api.post(`@fo me=@cemit Discord=[decode64(${encodedMes})]`);

        // If it's a command
      } else if (message.content.startsWith(this.prefix)) {
        this._processCmd(message);
      }
    });
    server.listen(this.tcpPort, () =>
      console.info(`Rhost-Bot TCP connected on port: ${this.tcpPort}`)
    );
    this.client
      .login(this.token)
      .catch(error => console.error("Rhost-Bot login error: ", error.message));
  }
}

module.exports = Bot;
