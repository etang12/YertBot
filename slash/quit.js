const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("quit")
    .setDescription("Stops YertBot and clears the queue of all songs"),

  run: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guild);

    if (!queue) {
      return await interaction.editReply("There are no songs in the queue");
    }

    // clears the bot's current queue and disconnects from server
    queue.destroy();

    await interaction.editReply("YertBot has been disconnected.");
  },
};
