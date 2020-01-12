module.exports = bot => {
  // Utility function
  bot.client.on("ready", () =>
    console.log(`Rhost Bot connected as: ${bot.client.user.tag}`)
  );

  bot.client.on("message", message => {
    if (
      // Make sure it's a channel message, but not a command.
      // Or output from Rhost-Bot.
      message.channel.name === "mush" &&
      !message.content.startsWith(bot.prefix) &&
      !message.content.startsWith("```")
    ) {
      const encodedMes = Base64.encode(formatChat(message));
      message.channel.send(utils.pre("[Discord] " + formatChat(message)));
      bot.api.post(`@fo me=@cemit Discord=[decode64(${encodedMes})]`);

      // If it's a command
    } else if (message.content.startsWith(bot.prefix)) {
      bot.processCmd(message);
    }
  });

  bot.client
    .login(bot.token)
    .catch(error => console.error("Rhost-Bot login error: ", error.message));
};
