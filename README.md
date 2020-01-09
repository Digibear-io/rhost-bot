# Rhost-Bot

A Discord bot designed to connect to a [RhostMUSH](http://rhostmush.com). This repo is very much under construction still. Right now the bot is under heavy development. **however!** If you'd like to install and run the bot as is:

```
1. git clone https://github.com/digibear.io/rhost-bot/.git
2. cd rhost-bot
3. npm install
4. Configure!  mv config.js.sample config.js
5. node .
```

### Some Notes

The config file is pretty simple at the moment, but will change in the future:

```json
{
    "token": "xxxxxxxxxx",  // Your bot API token
    "prefix": "!",  // The prefix for your bot's commands
    "esPort": 0000, // The port for the bot use either the API or
                    // connect to the game in robot mode.
    "dbref": "#00", // The #dbref of the API object, or robot.
    "password": "xxxx", // The API or robot password.
}
}
```

Have fun! But be aware, it might be broken at the moment. Remember, this repo is under construction. :3
