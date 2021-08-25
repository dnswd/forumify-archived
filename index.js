const PC = require('@prisma/client').PrismaClient
const prisma = new PC()
const { Client, Intents } = require("discord.js");
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

async function main() {
  client.on("error", (e) => console.error(e))

  client.on("ready", () => {
    console.log("I am ready!");
  });

  client.on("messageCreate", async (msg) => {
    if (msg.content.startsWith('/register')) {
      
    }
  });

  client.login(process.env.DC_TOKEN);
}

main()
  .catch(e => console.error(e))
  .finally(async() => { await prisma.$disconnect() })
