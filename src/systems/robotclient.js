const net = require("net");

module.exports = bot => {
  // Create the Robot connection
  const client = new net.Socket();

  const connect = () => {
    // When a connection is establised, log into the mush using the
    // provided credentials and emit a JSON string to tell the server
    // that the bot is actually connected.
    client.connect({ host: bot.host, port: bot.esPort }, () => {
      client.write(`co ${bot.dbref} ${bot.password}\r\n`);
      client.write(
        `@pemit me = %{${JSON.stringify({
          type: "conn",
          payload: 1
        })}%}\r\n`
      );

      // set a timeout incase the bot doesn't connect so we don't sit in limbo
      const timeout = setTimeout(() => {
        client.destroy();
        console.log("Unable to connect to Robot.");
      }, 10000);

      // The bot is logged in. Run nessisary 'boot' checks and code.
      bot.on("login", login => {
        if (login) {
          clearTimeout(timeout);
          console.log(
            `RhostBot connected and logged in: ${bot.host}:${bot.esPort}`
          );
          console.log("Checking for required attributes.");
        }
      });

      bot.on("ping", () => {});
    });
  };

  // If the client is disconnected, try to reconnect.
  client.on("close", error => {
    if (error) console.error("Robot Client closed because of error!");
  });

  client.on("error", err => console.error(err));
  client.on("data", buff => bot.processCmd(buff.toString()));

  // Start the client.
  connect();

  return {
    socket: client,
    connect
  };
};
