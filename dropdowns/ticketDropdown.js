const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    MessageFlags,
} = require('discord.js');
const TICKET_TYPES = require('../utils/ticketTypes');

module.exports = {
    customID: 'ticket:dropdown',

    async execute(interaction) {
        const typeKey = interaction.values[0];
        const ticket  = TICKET_TYPES[typeKey];

        if (!ticket) {
            return interaction.reply({ content: '❌ Invalid ticket type.', flags: MessageFlags.Ephemeral });
        }

        const modal = new ModalBuilder()
            .setCustomId(`ticketModal_${typeKey}`)
            .setTitle(`${ticket.label} Ticket`);

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('inquiry')
                    .setLabel('Describe your issue or inquiry')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Please provide as much detail as possible...')
                    .setRequired(true),
            ),
        );

        await interaction.showModal(modal);
    },
};
