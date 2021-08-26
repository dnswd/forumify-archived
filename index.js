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

function welcome(member) {
  const jokes = [
    'Visit pamulang',
    'Nonton star trek',
    'SORRY JIR!',
    'Establish Internet in Indonesia',
    'Lulus jadi kambing 🐐',
    'Kambing pun bisa dapet C 🐐',
    'Keluar vim pake `:wq` bukan `alt+F4` ya',
    'Pointer itu bukan black magic',
    'GNU/Linux bukan Linux',
    'POK enggak begitu kepake kok',
    'less lebih baik dari pada more',
    'btw i use arch',
    'kalo takut vim ada nano',
  ]

  return `***Welcome to ${member.guild.name} ~***
We're thrilled to have you here!~

Please kindly:
1. Read the *server rules*
2. Check if there's additional step after joining this server
3. Learn how to utilize discord
4. ${jokes[Math.floor(Math.random() * jokes.length)]}

Best of luck this semester 🍀
Jolan Tru~
`
}

async function main() {
  client.on("messageCreate", execute);
  client.on("error", (e) => console.error(e))
  client.on("guildMemberAdd", (member) => {
    member.send(welcome(member))
  })
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
