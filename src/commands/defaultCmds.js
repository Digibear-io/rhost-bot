module.exports = bot => {
  bot.addCmd({
    cmd: "who",
    desc: "See who's connected!",
    func: async (args, message) => {
      // import some utilities locally.
      const pre = bot.utils.pre;

      const res = await bot.api.get("u(me/fn.who)");

      if (res.ok) {
        let text = "";
        text += "Rhost-Bot - WHO\n";
        text += "============================================\n";
        text += res.data + "\n";
        text += "============================================\n";
        text += `- Use '${bot.prefix}help' for help.\n`;
        message.channel.send(pre(text));
      } else {
        message.channel.send(pre(`Unable to get WHO data: ${res.message}`));
      }
    }
  });
};
