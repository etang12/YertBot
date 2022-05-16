const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { QueryType } = require("discord-player");

module.exports = {
  // build slash commands without having to manually construct objects
  // build SlashCommandBuilder object
  data: new SlashCommandBuilder()
    // create command called play (Ex. /play)
    .setName("play")
    .setDescription("Loads songs from YouTube")
    // create subcommand (Ex. /play song)
    .addSubcommand((subcommand) => {
      return subcommand
        .setName("song")
        .setDescription("Loads a single song from url")
        // prompts user to input a URL to play (Ex. /play song {url})
        .addStringOption((option) => {
          return option
            .setName("url")
            .setDescription("the song's url")
            .setRequired(true);
        });
    })
    // create subcommand (Ex. /play playlist)
    .addSubcommand((subcommand) => {
      return subcommand
        .setName("playlist")
        .setDescription("Loads a playlist of songs from url")
        .addStringOption((option) => {
          return option
            .setName("url")
            .setDescription("the playlist url")
            .setRequired(true);
        });
    })
    // create subcommand (Ex. /play search)
    .addSubcommand((subcommand) => {
      return subcommand
        .setName("search")
        .setDescription("Searches for song based on provided keywords")
        .addStringOption((option) => {
          return option
            .setName("searchterms")
            .setDescription("search keywords")
            .setRequired(true);
        });
    }),
  run: async ({ client, interaction }) => {
    try {
      // check if user in voice channel
      if (!interaction.member.voice.channel) {
        return interaction.editReply(
          "You need to be in a voice channel to use this command!"
        );
      }

      // create queue for bot on the server
      const queue = await client.player.createQueue(interaction.guild);
      // if queue not connected to channel then connect bot to voice channel that member is in
      if (!queue.connection) {
        await queue.connect(interaction.member.voice.channel);
      }

      // create MessageEmbed object, bot uses to respond to user
      const embed = new MessageEmbed();

      if (interaction.options.getSubcommand() === "song") {
        const url = interaction.options.getString("url");
        // search for URL input (song) by user on YouTube
        const result = await client.player.search(url, {
          requestedBy: interaction.user,
          searchEngine: QueryType.YOUTUBE_VIDEO,
        });
        // result.tracks is an array that stores all videos found by that url
        if (result.tracks.length === 0) {
          return interaction.editReply("No results found");
        }

        const song = result.tracks[0];
        await queue.addTrack(song);
        // creates embed message to send to discord channel
        embed
          .setDescription(
            `**[${song.title}](${song.url})** has been added to the queue`
          )
          .setThumbnail(song.thumbnail)
          .setFooter({ text: `Duration: ${song.duration}` });
      } else if (interaction.options.getSubcommand() === "playlist") {
        const url = interaction.options.getString("url");
        // search for URL input (playlist) by user on YouTube
        const result = await client.player.search(url, {
          requestedBy: interaction.user,
          searchEngine: QueryType.YOUTUBE_PLAYLIST,
        });
        // result.tracks is an array that stores all videos found by that url
        if (result.tracks.length === 0) {
          return interaction.editReply("No results found");
        }

        const playlist = result.playlist;
        await queue.addTracks(result.tracks);
        embed
          .setDescription(
            `**${result.tracks.length} songs from [${playlist.title}](${playlist.url})** has been added to the queue`
          )
          .setThumbnail(playlist.thumbnail);
      } else if (interaction.options.getSubcommand() === "search") {
        const url = interaction.options.getString("searchterms");
        // search for URL input (song) by user on any platform (YouTube, Spotify, etc.)
        const result = await client.player.search(url, {
          requestedBy: interaction.user,
          searchEngine: QueryType.AUTO,
        });
        // result.tracks is an array that stores all videos found by that url
        if (result.tracks.length === 0) {
          return interaction.editReply("No results found");
        }

        const song = result.tracks[0];
        await queue.addTrack(song);
        embed
          .setDescription(
            `**[${song.title}](${song.url})** has been added to the queue`
          )
          .setThumbnail(song.thumbnail)
          .setFooter({ text: `Duration: ${song.duration}` });
      }
      // play queue if it's not already
      if (!queue.playing) {
        await queue.play();
      }
      // send embed messages back to discord channel
      await interaction.editReply({
        embeds: [embed],
      });
    } catch (err) {
      throw new Error(err);
    }
  },
};
