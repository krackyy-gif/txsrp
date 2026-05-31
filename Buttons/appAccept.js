const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customID: 'app_accept:',

    async execute(interaction) {
        const applicantId = interaction.customId.split(':')[1];

        const modal = new ModalBuilder()
            .setCustomId(`app_accept_modal:${applicantId}`)
            .setTitle('Accept Application');

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('reason')
                    .setLabel('Reason for acceptance')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('e.g. Great answers, showed professionalism...')
                    .setRequired(true),
            ),
        );

        await interaction.showModal(modal);
    },
};
