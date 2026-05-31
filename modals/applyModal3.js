const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
    customID: 'apply_modal_3',

    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        if (!client.applicationData) client.applicationData = new Map();

        const existing = client.applicationData.get(interaction.user.id) || { answers: {} };
        existing.answers.q11 = interaction.fields.getTextInputValue('q11');
        existing.answers.q12 = interaction.fields.getTextInputValue('q12');
        existing.answers.q13 = interaction.fields.getTextInputValue('q13');
        existing.answers.q14 = interaction.fields.getTextInputValue('q14');
        existing.answers.q15 = interaction.fields.getTextInputValue('q15');
        client.applicationData.delete(interaction.user.id);

        const { a } = existing;
        const answers = [
            existing.answers.q1,  existing.answers.q2,  existing.answers.q3,
            existing.answers.q4,  existing.answers.q5,  existing.answers.q6,
            existing.answers.q7,  existing.answers.q8,  existing.answers.q9,
            existing.answers.q10, existing.answers.q11, existing.answers.q12,
            existing.answers.q13, existing.answers.q14, existing.answers.q15,
        ];

        const channelId = client.config.APPLICATION_CHANNEL_ID;
        if (!channelId) {
            return interaction.editReply('❌ Application channel is not configured. Ask an admin to set it via `/config`.');
        }

        const channel = client.channels.cache.get(channelId)
            || await client.channels.fetch(channelId).catch(() => null);
        if (!channel) return interaction.editReply('❌ Application channel not found.');

        const qs = client.config.APP_QUESTIONS || [];
        const fields = qs.map((q, i) => ({
            name: `${i + 1}. ${q}`,
            value: answers[i] || 'No answer provided.',
            inline: false,
        }));

        const embed = new EmbedBuilder()
            .setTitle('New Staff Application')
            .setColor(0xFF8C14)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '👤  Applicant',  value: `${interaction.user} (\`${interaction.user.id}\`)`, inline: true },
                { name: '📅  Applied At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`,           inline: true },
                { name: '\u200b',         value: '\u200b',                                            inline: false },
                ...fields,
            )
            .setFooter({ text: 'Staff Applications' })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`app_accept:${interaction.user.id}`).setLabel('Accept').setStyle(ButtonStyle.Success).setEmoji('✅'),
            new ButtonBuilder().setCustomId(`app_deny:${interaction.user.id}`).setLabel('Deny').setStyle(ButtonStyle.Danger).setEmoji('❌'),
        );

        await channel.send({ embeds: [embed], components: [row] });
        return interaction.editReply('✅ Your application has been submitted! We will review it shortly.');
    },
};
