const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
} = require('discord.js');

module.exports = {
    customID: 'config:questions',

    async execute(interaction, client) {
        const selected = interaction.values[0];
        const q = client.config.APP_QUESTIONS || Array(15).fill('');

        const ranges = {
            APP_QUESTIONS_1: [0, 1, 2, 3, 4],
            APP_QUESTIONS_2: [5, 6, 7, 8, 9],
            APP_QUESTIONS_3: [10, 11, 12, 13, 14],
        };

        const indices = ranges[selected];
        if (!indices) return interaction.reply({ content: '❌ Unknown selection.', ephemeral: true });

        const modal = new ModalBuilder()
            .setCustomId(`config:questions_modal_${selected}`)
            .setTitle(`Application Questions (${selected.replace('APP_QUESTIONS_', 'Part ')})`);

        for (const i of indices) {
            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`q${i + 1}`)
                        .setLabel(`Question ${i + 1}`)
                        .setStyle(TextInputStyle.Short)
                        .setValue(q[i] || '')
                        .setRequired(false)
                        .setPlaceholder(`e.g. What is your Roblox username?`)
                ),
            );
        }

        await interaction.showModal(modal);
    },
};
