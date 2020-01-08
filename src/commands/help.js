module.exports = bot => {
  bot.addCmd({
    cmd: "help",
    desc: "This Screen",
    func: async (args, message) => {
      // import some utilities locally.
      const frame = bot.utils.frame;
      const just = bot.utils.just;
      let text = "";
      bot.help.forEach((v, k) => {
        text +=
          "\n" +
          just(v.usage || `${bot.prefix}${k}`, { len: 15 }) +
          just(v.desc || "", { len: 29 });
      });
      message.channel.send(frame("Help", text, bot.prefix));
    }
  });
};
