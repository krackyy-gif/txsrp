const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
    customID: 'apply_modal_2',

    async execute(interaction, client) {
        if (!client.applicationData) client.applicationData = new Map();

        const existing    = client.applicationData.get(interaction.user.id) || { answers: {} };
        existing.answers.q6  = interaction.fields.getTextInputValue('q6');
        existing.answers.q7  = interaction.fields.getTextInputValue('q7');
        existing.answers.q8  = interaction.fields.getTextInputValue('q8');
        existing.answers.q9  = interaction.fields.getTextInputValue('q9');
        existing.answers.q10 = interaction.fields.getTextInputValue('q10');
        client.applicationData.set(interaction.user.id, existing);

        return interaction.reply({
            content: '✅ **Part 2 saved.** Click below to continue with questions 11–15.',
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('apply_part3').setLabel('Continue to Part 3 of 3').setStyle(ButtonStyle.Primary).setEmoji('➡️'),
                ),
            ],
            flags: MessageFlags.Ephemeral,
        });
    },
};
