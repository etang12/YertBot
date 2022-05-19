const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("displays current song queue")
    // adds pagination to display song queue
    .addNumberOption((option) => {
      return option
        .setName("page")
        .setDescription("Page number of queue")
        .setMinValue(1);
    }),

  run: async ({ client, interaction }) => {
    // grabs queue from current discord server
    try {
      const queue = client.player.getQueue(interaction.guildId);
      if (!queue || !queue.playing) {
        return await interaction.editReply("There are no songs in the queue!");
      }

      // Determines number of pages needed to display songs
      // Ex. if 11 songs in queue --> 11 / 10 == 1.1 --> 2 (2 pages needed if each page can display 10 songs)
      const totalPages = Math.ceil(queue.tracks.length / 10) || 1;
      // checks to see if user input page number to display, if not then default to page 1
      const page = (interaction.options.getNumber("page") || 1) - 1;

      if (page > totalPages) {
        return await interaction.editReply(
          `Page does not exist. There are only ${totalPages} pages of songs.`
        );
      }

      // grabbing up to 10 songs to display for a single page
      const queueString = queue.tracks
        .slice(page * 10, page * 10 + 10)
        .map((song, i) => {
          return `**${page * 10 + i + 1}.** \`[${song.duration}]\` ${
            song.title
          } -- <@${song.requestedBy.id}>`;
        })
        .join("\n");

      const currSong = queue.current;

      const embed = new MessageEmbed();

      embed
        .setDescription(
          `**Currently playing**\n` +
            (currSong
              ? `\`[${currSong.duration}]\` ${currSong.title} -- <@${currSong.requestedBy.id}>`
              : "No song playing.") +
            `\n\n**Queue**\n${queueString}`
        )
        .setFooter({
          text: `Page ${page + 1} of ${totalPages}`,
        })
        .setThumbnail(currSong.setThumbnail);

      await interaction.editReply({
        embeds: [embed],
      });
    } catch (err) {
      throw new Error(err);
    }
  },
};
