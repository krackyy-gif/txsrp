const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
} = require('discord.js');
const TICKET_TYPES = require('../utils/ticketTypes');

module.exports = {
    name: 'ticket',
    aliases: [],

    async execute(message, args, client) {
        const embed = new EmbedBuilder()
            .setTitle('Support Ticket')
            .setDescription(
                'Need help? Open a ticket below and a member of our team will assist you shortly.\n\n' +
                'Please select the type that best matches your request from the menu below.'
            )
            .setColor(0x242429)
            .setTimestamp();

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket:dropdown')
                .setPlaceholder('Select a ticket type...')
                .addOptions(
                    Object.entries(TICKET_TYPES).map(([key, val]) => ({
                        label: val.label,
                        value: key,
                    }))
                ),
        );

        await message.channel.send({ embeds: [embed], components: [menu] });
    },
};
