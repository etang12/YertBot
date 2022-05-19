const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume playing the current paused song"),

  run: async ({ client, interaction }) => {
    try {
      const queue = client.player.getQueue(interaction.guild);

      if (!queue) {
        return await interaction.editReply("No songs currently playing");
      }

    queue.setPaused(false);

    return await interaction.editReply("Music has resumed playing!");

    } catch (err) {
      throw new Error(err);
    }
  },
};
