const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
    customID: 'app_deny_modal:',

    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const applicantId = interaction.customId.split(':')[1];
        const reason      = interaction.fields.getTextInputValue('reason');

        const applicant = await client.users.fetch(applicantId).catch(() => null);

        const dmEmbed = new EmbedBuilder()
            .setTitle('❌  Application Denied')
            .setDescription('Thank you for applying. Unfortunately, your application has been **denied** at this time.')
            .setColor(0xED4245)
            .addFields(
                { name: '📋  Reason',      value: reason,                                      inline: false },
                { name: '👤  Reviewed By', value: interaction.user.tag,                       inline: true },
                { name: '📅  Reviewed At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`,  inline: true },
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
                .setTitle('❌  Application Denied')
                .setColor(0xED4245)
                .setThumbnail(applicant?.displayAvatarURL({ dynamic: true }) ?? null)
                .addFields(
                    { name: '👤  Applicant',  value: applicant ? `${applicant} (\`${applicantId}\`)` : `\`${applicantId}\``, inline: true },
                    { name: '🛡️  Denied By',  value: `${interaction.user} (\`${interaction.user.id}\`)`,                    inline: true },
                    { name: '📋  Reason',     value: reason,                                                                  inline: false },
                    { name: '📅  Reviewed At',value: `<t:${Math.floor(Date.now() / 1000)}:F>`,                               inline: false },
                )
                .setFooter({ text: 'Staff Applications' })
                .setTimestamp();

            await resultChannel.send({ embeds: [resultEmbed] });
        }

        await interaction.message.edit({
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('app_deny_done')
                        .setLabel(`Denied by ${interaction.user.tag}`)
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                ),
            ],
        }).catch(() => {});

        return interaction.editReply(`✅ Application denied. ${applicant ? `${applicant} has been notified via DM.` : 'Could not DM the applicant.'}`);
    },
};
