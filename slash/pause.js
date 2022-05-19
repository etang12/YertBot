const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current song playing"),

  run: async ({ client, interaction }) => {
    try {
      const queue = client.player.getQueue(interaction.guild);

      if (!queue || !queue.playing) {
        return await interaction.editReply("No songs currently playing");
      }

    const currSong = queue.current;
    queue.stop();

    const embed = new MessageEmbed();

    embed.setDescription(`**[${currSong.title}](${currSong.url})** has been paused!`).setThumbnail(currSong.thumbnail);

    return await interaction.editReply({
        embeds: [embed]
    });

    } catch (err) {
      throw new Error(err);
    }
  },
};
