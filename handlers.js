const PC = require('@prisma/client').PrismaClient
const prisma = new PC()

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
  

  const channel = await msg.client.channels.fetch(result.channelId)
  // Fasilkom compliance
  console.log(`Anon message sent to ${channel.guild.name}/${channel.name}: ` + msg.content)
  channel.send({
    content: args.slice(2).join(" "),
    files: attachments
  })

}

async function disable_anon(msg, args) {
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
    console.error('Failed to deanon channel:' + e)
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
    console.error('Failed to register channel:' + e)
    msg.channel.send("Failed to enable anonymous questions. Is this channel registered? or maybe try another identifier?")
  }
}

async function unregister(msg, args) {
  try {
    await prisma.channels.delete({
      where: {
        channelId: msg.channelId
      }
    })
    msg.channel.send("This channel is no longer forumified")
  } catch (e) { console.error('Failed to unregister channel:' + e) }
}

async function register(msg, args) {
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

async function createThread(msg, args) {
  const result = await prisma.channels.findUnique({
    where: {
      channelId: msg.channelId
  }})
  if (!result) return
  msg.react('⬇')
  msg.react('⬆')
  if (msg.type == 'DEFAULT' && 
      !msg.channel.isThread() &&
      !msg.channel.isVoice()) {
    await msg.startThread({
      name: msg.content.substring(0, 100), // Max limit
      autoArchiveDuration: 60*24
    }).catch(e => console.error(e))
  }
}

module.exports = { register, unregister, enable_anon, disable_anon, ask, createThread }