const { readdirSync } = require("fs");
const { resolve } = require("path");
const utils = require("./utils");
const Discord = require("discord.js");
const API = require("@digibear/rhost-wrapper");
const { EventEmitter } = require("events");

const emitter = new EventEmitter();

module.exports = class Bot {
  /**
   * Create a new Bot object
   * @param {Object} options Paramaters passed to the bot.
   * @param {string} options.dbref The #dbref of the API object to
   * associate with the bot
   * @param {string} options.password  The password to access the RHost API
   * @param {string} options.token The discord token to log into the bot.
   * @param {string} [options.prefix]  The command prefix used for the bot.
   * @param {number} [options.esPort] The port to host the bot's TCP socket.
   * @param {string} [options.host] The host to connect to.
   * @param {Boolean} [options.robot] Should the bot start in HTTP API Mode, or Robot
   * Mode? If Robot mode is active then  dbref and password become the credintials
   * for the bot instead of the API object.
   */
  constructor({
    dbref,
    password,
    token,
    prefix = "!",
    esPort = 4950,
    host = "localhost",
    robot = false
  }) {
    this.dbref = dbref;
    this.password = password;
    this.utils = utils;
    this.token = token;
    this.client = new Discord.Client();
    this.api = new API({ user: dbref, password, encode: true });
    this.cmds = new Map();
    this.help = new Map();
    this.channels = new Map();
    this.prefix = prefix;
    this.esPort = esPort;
    this.host = host;
    this.robot = robot;
    this.emit = emitter.emit;
    this.on = emitter.on;
    this.roboClient = null;
    this.tcpServer = null;
    this.heartbeat = null;
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
      if (dirent.isFile()) {
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
   * @param {(message:any, args:String[]) => void} options.func The function to be run when the
   * command is entered on Discord.
   * @param {string} [options.desc] A few word description of the command.
   * @param {string} [options.usage] Shown in the help screen under the command entry.
   * Keep it short, maybe two or three words.
   * @param {string} [options.roles] A space seperated list of roles that
   * are authorized to use the command.
   */
  addCmd({ usage = "", cmd, func, roles = "", desc = "" }) {
    this.cmds.set(cmd.toLowerCase(), { func, roles, usage, desc });
    this.help.set(cmd, { usage, desc, roles });
  }

  /**
   * Process the incoming text for commands.
   * @param {*} message The discord message object.
   */
  processCmd(message) {
    /**
     *
     * @param {Boolean} found Indicator if a matching command was found.
     */
    const huh = found => {
      if (!found && message.channel) {
        message.channel.send(
          utils.pre(`Huh? Use '${this.prefix}help' for help`)
        );
      }
    };

    /**
     * Run through the available commads to find a match.
     * @param {string} cmd The command string given to the bot.
     * @param {string[]} args Any associated arguments that came
     * with the command string.
     */
    const run = async (cmd, args) => {
      let found = false;

      for (const k of this.cmds.keys()) {
        if (cmd === k) {
          found = true;
          await this.cmds.get(k).func(message, args);
        }
      }

      // if the command wasn't found, print a 'huh?' message,
      // MUSH style. :)
      huh(found);
    };

    // ----
    // Actually Process the command!
    // ----

    // See if the message is a JSON string, if not
    // treat it as text and slice awway!
    try {
      const msg = JSON.parse(message.content || message);

      // Process the value of the message type.
      switch (msg.type) {
        case "cmd":
          const cmd = msg.cmd;
          const args = msg.args || [];
          run(cmd, args);
          break;

        case "conn":
          // Let he bot know it's logged in.
          this.emit("login", true);
          break;

        default:
          break;
      }
    } catch {
      // If it's not a JSON string, then process
      // as plain text.  If it came from discord, grab .content,
      // else we're just working with a plain string from the game,
      const msg = message.content || message;
      const mushChan = msg.shift();
      const args = msg.split(" ");
      const cmd = args
        .shift()
        .slice(this.prefix.length)
        .toLowerCase();

      // is it a command?
      if (msg.startsWith(this.prefix)) {
        run(cmd, args);
        // ... or a channel message?
      } else if (this.channels.has(mushChan)) {
        chan(message);
      }
    }
  }

  /**
   * Start the Discord Bot
   */
  async start() {
    // Load commands
    await this.loadPluginDir(resolve(__dirname, "commands"));

    // Load systems
    if (this.robot) {
      this.roboClient = require("./systems/robotclient")(this);
    } else {
      this.tcpServer = require("./systems/tcpserver")(this);
    }
    require("./systems/discordclient")(this);
  }
};
