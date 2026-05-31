const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } = require('discord.js');
const Ticket = require('../models/Ticket');

module.exports = {
    customID: 'unclaimTicket',

    async execute(interaction) {
        const ticket = await Ticket.findOne({ channelId: interaction.channel.id }).catch(() => null);

        if (ticket && ticket.claimedBy !== interaction.user.id) {
            return interaction.reply({ content: '❌ You cannot unclaim a ticket you did not claim.', flags: MessageFlags.Ephemeral });
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claimTicket').setLabel('Claim').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('closeTicket').setLabel('Close').setStyle(ButtonStyle.Danger),
        );

        await interaction.update({ components: [row] });

        await interaction.channel.send({
            embeds: [new EmbedBuilder().setColor(0x242429).setDescription('This ticket has been unclaimed.')],
        });

        if (ticket) {
            ticket.claimedBy   = null;
            ticket.claimStatus = 'unclaimed';
            await ticket.save().catch(console.error);
        }
    },
};
