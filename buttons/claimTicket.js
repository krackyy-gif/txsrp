const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } = require('discord.js');
const Ticket = require('../models/Ticket');

module.exports = {
    customID: 'claimTicket',

    async execute(interaction) {
        const roleId = interaction.client.config.TICKET_CLAIM_ROLE_ID;
        if (roleId && !interaction.member.roles.cache.has(roleId)) {
            return interaction.reply({ content: '❌ You do not have permission to claim tickets.', flags: MessageFlags.Ephemeral });
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('unclaimTicket').setLabel('Unclaim').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('closeTicket').setLabel('Close').setStyle(ButtonStyle.Danger),
        );

        await interaction.update({ components: [row] });

        await interaction.channel.send({
            embeds: [new EmbedBuilder().setColor(0x242429).setDescription(`This ticket has been claimed by <@${interaction.user.id}>.`)],
        });

        await Ticket.findOneAndUpdate(
            { channelId: interaction.channel.id },
            { claimedBy: interaction.user.id, claimStatus: 'claimed' }
        ).catch(console.error);
    },
};
