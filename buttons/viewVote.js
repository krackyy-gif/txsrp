const { MessageFlags } = require('discord.js');

const REQUIRED_VOTES = 7;

module.exports = {
    customID: 'viewvote:button',

    async execute(interaction, client) {
        const sessionId = interaction.customId.split('_')[1];
        const votes     = client.voteMap?.get(sessionId) || new Map();

        const mentions = [...votes.keys()].map(id => `<@${id}>`);
        const content  = mentions.length ? mentions.join('\n') : 'No votes yet.';

        await interaction.reply({
            content: `**Voters (\`${votes.size}/${REQUIRED_VOTES}\`)**:\n${content}`,
            flags: MessageFlags.Ephemeral,
        });
    },
};
