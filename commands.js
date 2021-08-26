const Handler = require('./handlers.js')
const { Permissions } = require('discord.js');

const COMMANDS = {
  '/forumify': {
    handler: Handler.register,
    protected: true,
    channelOnly: true
  },
  '/disable': {
    handler: Handler.unregister,
    protected: true,
    channelOnly: true
  },
  '/anonymize': {
    handler: Handler.enable_anon,
    protected: true,
    channelOnly: true
  },
  '/disanon': {
    handler: Handler.disable_anon,
    protected: true,
    channelOnly: true
  },
  '/ask': {
    handler: Handler.ask,
    dmOnly: true
  },
  DEFAULT: {
    handler: Handler.createThread,
    channelOnly: true
  }
}

function execute(msg) {
  const rawArgs = msg.content.split(" ")
  let cmd = COMMANDS[rawArgs[0]]

  if (!cmd) cmd = COMMANDS.DEFAULT
  if (cmd.dmOnly && msg.guildId) return
  if (cmd.channelOnly && !msg.guildId) return
  if (cmd.protected && 
      msg.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS))
      return 

  cmd.handler.call(this, msg, rawArgs)
}

module.exports = execute