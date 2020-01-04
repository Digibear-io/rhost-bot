module.exports = bot => {
  bot.addCmd({
    cmd: "help",
    usage: `${bot.prefix}help <topic>`,
    desc: "Get help with commands!",
    func: async (args, message) => {
      // import some utilities locally.
      const frame = bot.utils.frame;
      const just = bot.utils.just;
      let text = "\n";
      bot.help.forEach((v, k) => {
        text +=
          just(v.usage || `${bot.prefix}${k}`, { len: 18 }) +
          just(v.desc || "") +
          "\n";
      });
      message.channel.send(frame("Help", text, bot.prefix));
    }
  });
};
