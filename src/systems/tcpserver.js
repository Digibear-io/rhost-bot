module.exports = bot => {
  // Configure the TCP server.
  const server = require("net").createServer(socket => {
    socket.on("connect", () => console.log("New connection!"));
    socket.on("data", buff => {
      const chan = bot.client.channels.find(val => val.name === "mush");
      chan.send(utils.pre("[Discord] " + buff.toString()));
    });
  });

  server.listen(bot.esPort, () =>
    console.info(`Rhost-Bot TCP connected on port: ${bot.esPort}`)
  );
};
