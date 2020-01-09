module.exports = bot => {
  bot.addCmd({
    cmd: "credits",
    desc: "The credit page!",
    func: mess => {
      let text = "\n2020 Kumakun @ RhostDev\n";
      text += "MIT Licensed.\n\n";
      text += "Visit us on Github!\n";
      text += "* https://github.com/digibear-io/\n\n";
      text += "Feature requests, comments, bugs?\n";
      text += "* https//github.com/digibear-io/issues/";

      mess.channel.send(bot.utils.frame("Credits", text));
    }
  });
};
