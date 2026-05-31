const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } = require('discord.js');

module.exports = {
    customID: 'apply_part2',

    async execute(interaction, client) {
        if (!client.applicationData?.has(interaction.user.id)) {
            return interaction.reply({ content: '❌ Your application session has expired. Please start again.', flags: MessageFlags.Ephemeral });
        }

        const q = client.config.APP_QUESTIONS || [];

        const modal = new ModalBuilder().setCustomId('apply_modal_2').setTitle('Staff Application (2 of 3)');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q6').setLabel(`6. ${q[5] || 'Question 6'}`).setStyle(TextInputStyle.Paragraph).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q7').setLabel(`7. ${q[6] || 'Question 7'}`).setStyle(TextInputStyle.Paragraph).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q8').setLabel(`8. ${q[7] || 'Question 8'}`).setStyle(TextInputStyle.Paragraph).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q9').setLabel(`9. ${q[8] || 'Question 9'}`).setStyle(TextInputStyle.Paragraph).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q10').setLabel(`10. ${q[9] || 'Question 10'}`).setStyle(TextInputStyle.Short).setRequired(true)),
        );

        await interaction.showModal(modal);
    },
};
