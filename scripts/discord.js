#!/bin/env Node

const net = require("net");
// Connect to the specified port and send the payload and
// disconnect.  Pretty straight forward!
message = process.argv.slice(2).join();
console.log(message);
const Client = new net.Socket();
Client.connect(4950, () => {
  Client.write(message + "\r\n");
  Client.destroy();
});
