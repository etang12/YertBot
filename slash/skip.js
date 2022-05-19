const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip current song."),

  run: async ({ client, interaction }) => {
    try {
      const queue = client.player.getQueue(interaction.guildId);

      if (!queue || !queue.playing) {
        return await interaction.editReply(
          "No songs currently in queue to skip!"
        );
      }
    } catch (err) {
      throw new Error(err);
    }
  },
};
