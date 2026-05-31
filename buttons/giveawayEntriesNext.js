const { MessageFlags } = require('discord.js');
const Giveaway = require('../models/Giveaway');
const { buildPage } = require('./giveawayEntries');

module.exports = {
    customID: 'giveaway:entries_next:',

    async execute(interaction) {
        const parts = interaction.customId.split(':');
        const page  = Number(parts[parts.length - 1]) + 1;

        const giveaway = await Giveaway.findOne({ messageId: interaction.message.id });
        if (!giveaway) return interaction.reply({ content: '❌ Giveaway not found.', flags: MessageFlags.Ephemeral });

        await interaction.update({ components: [buildPage(giveaway, page)], flags: MessageFlags.IsComponentsV2 });
    },
};
