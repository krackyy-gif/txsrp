const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } = require('discord.js');

module.exports = {
    customID: 'apply_part3',

    async execute(interaction, client) {
        if (!client.applicationData?.has(interaction.user.id)) {
            return interaction.reply({ content: '❌ Your application session has expired. Please start again.', flags: MessageFlags.Ephemeral });
        }

        const q = client.config.APP_QUESTIONS || [];

        const modal = new ModalBuilder().setCustomId('apply_modal_3').setTitle('Staff Application (3 of 3)');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q11').setLabel(`11. ${q[10] || 'Question 11'}`).setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q12').setLabel(`12. ${q[11] || 'Question 12'}`).setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q13').setLabel(`13. ${q[12] || 'Question 13'}`).setStyle(TextInputStyle.Paragraph).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q14').setLabel(`14. ${q[13] || 'Question 14'}`).setStyle(TextInputStyle.Paragraph).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q15').setLabel(`15. ${q[14] || 'Question 15'}`).setStyle(TextInputStyle.Short).setRequired(true)),
        );

        await interaction.showModal(modal);
    },
};
