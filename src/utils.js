const Base64 = require("js-base64").Base64;

/**
 * Wrap a string in markdown for <pre> tag.
 */
module.exports.pre = string => "```" + string + "```";
module.exports.encode64 = string => Base64.encode(string);
module.exports.decode64 = string => Base64.decode(string);

module.exports.frame = (title, content, prefix) => {
  text = `Rhost-Bot - ${title}\n`;
  text += "============================================";
  text += content + "\n";
  text += "============================================\n";
  text += `- Use '${prefix}help' for help.\n`;
  return module.exports.pre(text);
};

module.exports.just = (string = "", options = {}) => {
  const { len = 25, just = "left", fill = " " } = options;
  let workingLength = len - string.length;
  if (workingLength < 0) {
    string = string.slice(0, len - 3);
    string += "...";
    workingLength = 0;
  }
  switch (just.toLowerCase()) {
    case "left":
      return string + fill.repeat(workingLength);
    case "right":
      return fill.repeat(workingLength) + string;
    case "center":
      const split = Math.round(workingLength / 2);
      const remainder = workingLength - split * 2;
      return fill.repeat(split) + string + fill.repeat(split + remainder);
    default:
      return string + fill.repeat(workingLength);
  }
};

module.exports.formatChat = message => {
  let chatMes = message.content ? message.content : message;
  let chatText = "";
  let user = message.member.displayName;

  if (chatMes.startsWith(":")) {
    chatText += `${user} ${chatMes.slice(1)}`;
  } else if (chatMes.startsWith(";")) {
    chatText += `${user}${chatMes.slice(1)}`;
  } else if (chatMes.startsWith('"') || chatMes.startsWith("'")) {
    chatText += `${user} says, "${chatMes.slice(1)}"`;
  } else {
    chatText += `${user} says, "${chatMes}"`;
  }

  return chatText;
};
