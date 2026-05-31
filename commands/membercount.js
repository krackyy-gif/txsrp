const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('membercount')
        .setDescription('Show total members, online members, and server boosts.'),

    async execute(interaction) {
        const { guild } = interaction;

        await guild.members.fetch({ withPresences: true });

        const total  = guild.memberCount;
        const online = guild.members.cache.filter(m => m.presence?.status !== 'offline').size;
        const boosts = guild.premiumSubscriptionCount || 0;

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Member Count')
                    .setColor(0x242429)
                    .addFields(
                        { name: 'Total Members',  value: String(total),  inline: true },
                        { name: 'Online Members', value: String(online), inline: true },
                        { name: 'Server Boosts',  value: String(boosts), inline: true },
                    )
                    .setTimestamp(),
            ],
        });
    },
};
