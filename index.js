const http = require('http');
const PC = require('@prisma/client').PrismaClient
const { Client, Intents } = require("discord.js");
const prisma = new PC()
const client = new Client({ 
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
  ],
  partials: [
    'MESSAGE', 
    'CHANNEL', 
    'REACTION'
  ] 
}); 
require('dotenv').config()

async function ask(msg, args) {
  if (args.length < 2) {
    msg.channel.send("Missing parameter alias: `/anon alias`")
    return
  }

  // resolve alias
  const result = await prisma.channels.findUnique({
    where: {
      alias: args[1]
    }
  })

  if (!result) {
    msg.channel.send("Unrecognized forum identifier")
    return
  }

  // resolve atatchments
  const attachments = []
  msg.attachments.forEach((v, k) => { attachments.push(v.url) })
  

  const channel = await client.channels.fetch(result.channelId)
  channel.send({
    content: args.slice(2).join(" "),
    files: attachments
  })

}

async function disable_anon(msg) {
  try {
    await prisma.channels.update({
      data: {
        channelId: msg.channelId,
        alias: null
      },
      where: {
        channelId: msg.channelId,
      }
    })
    msg.channel.send("Successfullly deanonymize this forum.")
  } catch (e) {
    console.error(e)
    msg.channel.send("Failed to disable anonymous questions. Maybe this forum isn't anonymized after all.")
  }
}

async function enable_anon(msg, args) {
  if (args.length < 2) {
    msg.channel.send("Missing parameter alias: `/anon alias`")
    return
  }

  try {
    await prisma.channels.update({
      data: {
        channelId: msg.channelId,
        alias: args[1]
      },
      where: {
        channelId: msg.channelId,
      }
    })
    msg.channel.send(`Anonymous questions are now enabled, using ${args[1]} as identifier.`)
  } catch (e) {
    console.error(e)
    msg.channel.send("Failed to enable anonymous questions. Is this channel registered? or maybe try another identifier?")
  }
}

async function unregister(msg) {
  try {
    await prisma.channels.delete({
      where: {
        channelId: msg.channelId
      }
    })
    msg.channel.send("This channel is no longer forumified")
  } catch { }
}

async function register(msg) {
  msg.channel.send("Registering channel...")
  const channelId = await prisma.channels.findUnique({
    where: {
      channelId: msg.channelId
    }})

  if (!channelId) {
    await prisma.channels.create({
      data: {
        channelId: msg.channelId
      }
    })
    msg.channel.send("This channel is now forumified 🎉🎉")
    return
  }
  msg.channel.send("Failed to forumify this channel, maybe it's already forumified?")
}

async function main() {
  client.on("error", (e) => console.error(e))

  client.on("ready", () => {
    console.log("I am ready!");
  });

  client.on("messageCreate", async (msg) => {
    if (msg.channel.isThread()) return
    const cmd = msg.content.split(" ")

    switch (cmd[0]) {
      case '/reg':
        register(msg)
        break
      case '/unreg':
        unregister(msg)
        break
      case '/anon':
        enable_anon(msg, cmd)
        break
      case '/disanon':
        disable_anon(msg)
        break
      case '/ask':
        ask(msg, cmd)
        break
      default:
        if (!msg.guildId) return
        const result = await prisma.channels.findUnique({
          where: {
            channelId: msg.channelId
        }})
        if (msg.type != 'THREAD_CREATED' && result) {
          msg.react('⬇')
          msg.react('⬆')
          await msg.startThread({
            name: msg.content.substring(0, 100),
            autoArchiveDuration: 60*24
          }).catch(e => console.error(e))
        }
    }
  });

  client.login(process.env.DC_TOKEN);
}

const requestListener = function (req, res) {
  res.writeHead(200);
  res.end('Pong!');
}

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 8080);

main()
  .catch(e => console.error(e))
  .finally(async() => { await prisma.$disconnect() })
