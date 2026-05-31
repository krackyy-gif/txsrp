const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } = require('discord.js');

module.exports = {
    customID: 'closeTicket',

    async execute(interaction) {
        const roleId = interaction.client.config.TICKET_CLOSE_ROLE_ID;
        if (roleId && !interaction.member.roles.cache.has(roleId)) {
            return interaction.reply({ content: '❌ You do not have permission to close tickets.', flags: MessageFlags.Ephemeral });
        }

        const modal = new ModalBuilder().setCustomId('closeTicketModal').setTitle('Close Ticket');
        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('closeReason')
                    .setLabel('Reason for closing')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Enter the reason here...')
                    .setRequired(false)
            )
        );

        await interaction.showModal(modal);
    },
};
