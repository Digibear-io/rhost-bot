module.exports = bot => {
  bot.addCmd({
    cmd: "who",
    desc: "See who's connected!",
    func: async message => {
      // import some utilities locally.
      const pre = bot.utils.pre;
      const frame = bot.utils.frame;
      const decode64 = bot.utils.decode64;

      const res = await bot.api
        .get("u(me/fn.who)")
        .catch(err => console.error(err));

      if (res.ok) {
        let text = "\nName                             On For idle\n";
        text += "--------------------------------------------";

        return message.channel.send(
          frame(`Who`, text + decode64(res.data), bot.prefix)
        );
      } else {
        return message.channel.send(
          pre(`Unable to get WHO data: ${res.message}`)
        );
      }
    }
  });
};
