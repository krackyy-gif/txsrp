const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Add a user to this ticket channel.')
        .addUserOption(o =>
            o.setName('user').setDescription('The user to add.').setRequired(true)
        ),

    async execute(interaction) {
        const { channel, guild, member } = interaction;
        const target       = interaction.options.getUser('user');
        const targetMember = guild.members.cache.get(target.id);

        if (!channel.name.endsWith('-ticket')) {
            return interaction.reply({ content: 'This command can only be used inside a ticket channel.', flags: MessageFlags.Ephemeral });
        }
        if (!targetMember) {
            return interaction.reply({ content: 'Could not find that user in this server.', flags: MessageFlags.Ephemeral });
        }
        if (channel.permissionOverwrites.cache.has(target.id)) {
            return interaction.reply({ content: `<@${target.id}> already has access to this ticket.`, flags: MessageFlags.Ephemeral });
        }

        await channel.permissionOverwrites.create(targetMember, {
            ViewChannel: true, SendMessages: true, ReadMessageHistory: true,
        });

        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x242429).setDescription(`<@${target.id}> has been added by <@${member.id}>.`)],
        });
    },
};
