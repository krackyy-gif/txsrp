const { MessageFlags } = require('discord.js');
const registerCommands = require('../loaders/registerCommands');

module.exports = {
    customID: 'fix:resync',

    async execute(interaction, client) {
        const cfg = client.config;
        const isOwner     = interaction.guild.ownerId === interaction.user.id;
        const isSuperuser = (cfg.SUPERUSER_IDS || []).map(String).includes(String(interaction.user.id));

        if (!isOwner && !isSuperuser) {
            return interaction.reply({ content: '❌ Only the server owner or superusers can do this.', flags: MessageFlags.Ephemeral });
        }

        await interaction.reply({ content: '🔄 Re-syncing slash commands...', flags: MessageFlags.Ephemeral });

        try {
            registerCommands(client);
            await interaction.editReply({ content: '✅ Slash commands re-synced successfully.' });
        } catch (err) {
            console.error('Re-sync error:', err);
            await interaction.editReply({ content: `❌ Re-sync failed: ${err.message}` });
        }
    },
};
