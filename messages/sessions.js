const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');

module.exports = {
    name: 'sessions',
    aliases: ['session'],

    async execute(message, args, client) {
        const notifRoleId = client.config.NOTIFICATION_ROLE_ID;

        const embed = new EmbedBuilder()
            .setTitle('Session Notifications')
            .setDescription(
                `Click the button below to toggle session notifications.\n\n` +
                `When sessions start, you will be pinged ${notifRoleId ? `with <@&${notifRoleId}>` : 'in the sessions channel'}.`
            )
            .setColor(0x242429)
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('sessionsRole:button')
                .setLabel('Toggle Notifications')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🔔'),
        );

        await message.channel.send({ embeds: [embed], components: [row] });
    },
};
