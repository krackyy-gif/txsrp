const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customID: 'app_deny:',

    async execute(interaction) {
        const applicantId = interaction.customId.split(':')[1];

        const modal = new ModalBuilder()
            .setCustomId(`app_deny_modal:${applicantId}`)
            .setTitle('Deny Application');

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('reason')
                    .setLabel('Reason for denial')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('e.g. Insufficient experience, failed requirements...')
                    .setRequired(true),
            ),
        );

        await interaction.showModal(modal);
    },
};
