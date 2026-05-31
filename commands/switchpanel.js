const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const TICKET_TYPES = require('../utils/ticketTypes');
const { hasPerm } = require('../utils/staffHelpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('switchpanel')
        .setDescription('Switch this ticket channel to a different panel category.')
        .addStringOption(o =>
            o.setName('panel')
             .setDescription('The panel to switch this ticket to.')
             .setRequired(true)
             .addChoices(...Object.entries(TICKET_TYPES).map(([key, val]) => ({ name: val.label, value: key })))
        ),

    async execute(interaction) {
        if (!interaction.channel.name.endsWith('-ticket')) {
            return interaction.reply({ content: '❌ This command can only be used inside a ticket channel.', flags: MessageFlags.Ephemeral });
        }
        if (!hasPerm(interaction)) {
            return interaction.reply({ content: '❌ You do not have permission.', flags: MessageFlags.Ephemeral });
        }

        const key   = interaction.options.getString('panel');
        const panel = TICKET_TYPES[key];
        if (!panel) return interaction.reply({ content: '❌ Invalid panel.', flags: MessageFlags.Ephemeral });

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const ch = interaction.channel;

        if (panel.categoryId) {
            const cat = interaction.guild.channels.cache.get(panel.categoryId)
                || await interaction.guild.channels.fetch(panel.categoryId).catch(() => null);
            if (cat) await ch.setParent(panel.categoryId, { lockPermissions: false }).catch(console.error);
        }

        if (panel.pingRoleId) {
            await ch.permissionOverwrites.edit(panel.pingRoleId, { ViewChannel: true, SendMessages: true }).catch(() => {});
        }

        const embed = new EmbedBuilder()
            .setColor(0x242429)
            .setTitle('Panel Switched')
            .setDescription(`This ticket has been moved to **${panel.label}**.`)
            .addFields(
                { name: 'New Panel',   value: panel.label,                                   inline: true },
                { name: 'Switched By', value: `${interaction.user}`,                          inline: true },
                { name: 'Ping Role',   value: panel.pingRoleId ? `<@&${panel.pingRoleId}>` : 'None', inline: true },
            )
            .setTimestamp();

        await ch.send({ content: panel.pingRoleId ? `<@&${panel.pingRoleId}>` : '', embeds: [embed] });
        await interaction.editReply(`✅ Ticket switched to **${panel.label}**.`);
    },
};
