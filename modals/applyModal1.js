const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
    customID: 'apply_modal_1',

    async execute(interaction, client) {
        if (!client.applicationData) client.applicationData = new Map();

        const existing   = client.applicationData.get(interaction.user.id) || { answers: {} };
        existing.answers.q1 = interaction.fields.getTextInputValue('q1');
        existing.answers.q2 = interaction.fields.getTextInputValue('q2');
        existing.answers.q3 = interaction.fields.getTextInputValue('q3');
        existing.answers.q4 = interaction.fields.getTextInputValue('q4');
        existing.answers.q5 = interaction.fields.getTextInputValue('q5');
        client.applicationData.set(interaction.user.id, existing);

        return interaction.reply({
            content: '✅ **Part 1 saved.** Click below to continue with questions 6–10.',
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('apply_part2').setLabel('Continue to Part 2 of 3').setStyle(ButtonStyle.Primary).setEmoji('➡️'),
                ),
            ],
            flags: MessageFlags.Ephemeral,
        });
    },
};
