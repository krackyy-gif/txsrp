const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a user from this ticket channel.')
        .addUserOption(o =>
            o.setName('user').setDescription('The user to remove.').setRequired(true)
        ),

    async execute(interaction) {
        const { channel, member } = interaction;
        const target = interaction.options.getUser('user');

        if (!channel.name.endsWith('-ticket')) {
            return interaction.reply({ content: 'This command can only be used inside a ticket channel.', flags: MessageFlags.Ephemeral });
        }
        if (!channel.permissionOverwrites.cache.has(target.id)) {
            return interaction.reply({ content: `<@${target.id}> does not have access to this ticket.`, flags: MessageFlags.Ephemeral });
        }

        await channel.permissionOverwrites.delete(target.id);

        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x242429).setDescription(`<@${target.id}> has been removed by <@${member.id}>.`)],
        });
    },
};
