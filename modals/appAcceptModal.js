const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
    customID: 'app_accept_modal:',

    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const applicantId = interaction.customId.split(':')[1];
        const reason      = interaction.fields.getTextInputValue('reason');

        const applicant = await client.users.fetch(applicantId).catch(() => null);

        const dmEmbed = new EmbedBuilder()
            .setTitle('✅  Application Accepted')
            .setDescription('Thank you for applying. Your application has been **accepted**!')
            .setColor(0x00D278)
            .addFields(
                { name: '📋  Reason',      value: reason,                                       inline: false },
                { name: '👤  Reviewed By', value: interaction.user.tag,                        inline: true },
                { name: '📅  Reviewed At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`,   inline: true },
            )
            .setFooter({ text: 'Staff Applications' })
            .setTimestamp();

        if (applicant) await applicant.send({ embeds: [dmEmbed] }).catch(() => {});

        const resultChannelId = client.config.APP_RESULT_CHANNEL_ID;
        const resultChannel   = resultChannelId
            ? client.channels.cache.get(resultChannelId) || await client.channels.fetch(resultChannelId).catch(() => null)
            : null;

        if (resultChannel) {
            const resultEmbed = new EmbedBuilder()
                .setTitle('✅  Application Accepted')
                .setColor(0x00D278)
                .setThumbnail(applicant?.displayAvatarURL({ dynamic: true }) ?? null)
                .addFields(
                    { name: '👤  Applicant',   value: applicant ? `${applicant} (\`${applicantId}\`)` : `\`${applicantId}\``, inline: true },
                    { name: '🛡️  Accepted By', value: `${interaction.user} (\`${interaction.user.id}\`)`,                    inline: true },
                    { name: '📋  Reason',      value: reason,                                                                  inline: false },
                    { name: '📅  Reviewed At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`,                               inline: false },
                )
                .setFooter({ text: 'Staff Applications' })
                .setTimestamp();

            await resultChannel.send({ embeds: [resultEmbed] });
        }

        await interaction.message.edit({
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('app_accept_done')
                        .setLabel(`Accepted by ${interaction.user.tag}`)
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(true),
                ),
            ],
        }).catch(() => {});

        return interaction.editReply(`✅ Application accepted. ${applicant ? `${applicant} has been notified via DM.` : 'Could not DM the applicant.'}`);
    },
};
