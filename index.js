const Discord = require("discord.js");
const dotenv = require("dotenv");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const { Player } = require("discord-player");

dotenv.config();
const TOKEN = process.env.TOKEN;

// store boolean if "load" typed in command line
// boolean used to load slash commands
const LOAD_SLASH = process.argv[2] == "load";

// DEPLOY SLASH COMMANDS
// client id for bot
const CLIENT_ID = "969472094704394240";

// server that bot is executuable in
const GUILD_ID = "328391099032797184";

// intents allow bot to see which servers it's in and voice channels states
const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_VOICE_STATES"],
});

// creates hashmap
client.slashcommands = new Discord.Collection();
// creates Discord Player used to facilitate music commands
client.player = new Player(client, {
  ytdlOptions: {
    quality: "highestaudio",
    highWaterMark: 1 << 25,
  },
});

const commands = [];

const slashFiles = fs.readdirSync("./slash");
// .filter((file) => {
//   file.endsWith(".js");
// });
console.log(slashFiles);
for (const file of slashFiles) {
  const slashcmd = require(`./slash/${file}`);
  // Set a new item in slashcommands Collection (Map object)
  // Key: command name, Value: command
  client.slashcommands.set(slashcmd.data.name, slashcmd);
  if (LOAD_SLASH) {
    console.log('hello');
    commands.push(slashcmd.data.toJSON());
  }
}
console.log(commands);

// deploying slash commands to bot
if (LOAD_SLASH) {
  const rest = new REST({
    version: "9",
  }).setToken(TOKEN);
  console.log("Deploying slash commands");
  // generate URL with CLIENT_ID and GUILD_ID
  // deploys slash commands to the bot
  rest
    .put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    })
    .then(() => {
      console.log("Successfully loaded commands!");
      process.exit(0);
    })
    .catch((err) => {
      if (err) {
        console.log(err);
        process.exit(1);
      }
    });
} else {
  client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
  });
  // interactionCreate (event listener) listening for when user inputs slash command (Ex. /play song)
  client.on("interactionCreate", (interaction) => {
    console.log(interaction);
    async function handleCommand() {
      // checks that the interaction must be a slash command
      if (!interaction.isCommand()) {
        return;
      }

      const slashcmd = client.slashcommands.get(interaction.commandName);
      if (!slashcmd) {
        interaction.reply("Not a valid slash command");
      }
      // Discord defaults to 3 seconds for bot response, if no response by 3 seconds then response is cancelled
      // gives bot more time to respond to slash commands and sends message (Thinking...) in chat before replying
      await interaction.deferReply();
      // handle the interaction (slash command) then client (bot) executes it
      await slashcmd.run({ client, interaction });
    }
    handleCommand();
  });
  client.login(TOKEN);
}
