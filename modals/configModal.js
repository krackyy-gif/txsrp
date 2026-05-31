const fs   = require('node:fs');
const path = require('node:path');
const { MessageFlags } = require('discord.js');

const CONFIG_PATH = path.join(__dirname, '..', 'config.json');

const ARRAY_KEYS   = ['SUPERUSER_IDS'];
const SUPERUSER_OPS = ['SUPERUSER_ADD', 'SUPERUSER_REMOVE'];

module.exports = {
    customID: 'config:modal_',

    async execute(interaction, client) {
        const key = interaction.customId.replace('config:modal_', '');
        const raw = interaction.fields.getTextInputValue('value')?.trim();

        const cfg  = client.config;
        const isSuperuser = (cfg.SUPERUSER_IDS || []).map(String).includes(String(interaction.user.id));

        if (interaction.guild.ownerId !== interaction.user.id && !isSuperuser) {
            return interaction.reply({ content: '❌ Only the server owner or superusers can change config.', flags: MessageFlags.Ephemeral });
        }

        if (key === 'SUPERUSER_ADD') {
            if (!raw) return interaction.reply({ content: '❌ Please provide a user ID.', flags: MessageFlags.Ephemeral });
            const ids = (cfg.SUPERUSER_IDS || []).map(String);
            if (!ids.includes(raw)) ids.push(raw);
            cfg.SUPERUSER_IDS = ids;
        } else if (key === 'SUPERUSER_REMOVE') {
            if (!raw) return interaction.reply({ content: '❌ Please provide a user ID.', flags: MessageFlags.Ephemeral });
            cfg.SUPERUSER_IDS = (cfg.SUPERUSER_IDS || []).filter(id => String(id) !== raw);
        } else if (ARRAY_KEYS.includes(key)) {
            cfg[key] = raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : [];
        } else {
            cfg[key] = raw || '';
        }

        try {
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 4), 'utf8');
        } catch (err) {
            console.error('Failed to save config:', err);
            return interaction.reply({ content: '❌ Failed to save config to disk.', flags: MessageFlags.Ephemeral });
        }

        await interaction.reply({ content: `✅ **${key}** updated successfully. Restart the bot for some settings to take effect.`, flags: MessageFlags.Ephemeral });
    },
};
