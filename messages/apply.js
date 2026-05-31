const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
} = require('discord.js');

module.exports = {
    name: 'apply',
    aliases: [],

    async execute(message, args, client) {
        const embed = new EmbedBuilder()
            .setTitle('Staff Applications')
            .setDescription(
                'We are currently **accepting** applications for our Staff Team!\n\n' +
                '**Requirements:**\n' +
                '- Must be 13 years or older\n' +
                '- Must be an active community member\n' +
                '- Must have a stable internet connection\n\n' +
                'Click the button below to start your application. Read each question carefully — you will have **3 parts** of **5 questions** each.'
            )
            .setColor(0xFF8C14)
            .setTimestamp();

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('apply:dropdown')
                .setPlaceholder('Select an option...')
                .addOptions([{ label: '📝  Apply for Staff', value: 'apply' }]),
        );

        await message.channel.send({ embeds: [embed], components: [menu] });
    },
};
