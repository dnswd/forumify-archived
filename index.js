const http = require('http');
const PC = require('@prisma/client').PrismaClient
const { Client, Intents } = require("discord.js");
const execute = require("./commands");
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

async function main() {
  client.on("messageCreate", execute);
  client.on("error", (e) => console.error(e))
  client.on("ready", () => {
    console.log("I am ready!");
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
