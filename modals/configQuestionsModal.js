const fs   = require('node:fs');
const path = require('node:path');
const { MessageFlags } = require('discord.js');

const CONFIG_PATH = path.join(__dirname, '..', 'config.json');

const RANGES = {
    APP_QUESTIONS_1: [0,1,2,3,4],
    APP_QUESTIONS_2: [5,6,7,8,9],
    APP_QUESTIONS_3: [10,11,12,13,14],
};

module.exports = {
    customID: 'config:questions_modal_',

    async execute(interaction, client) {
        const part = interaction.customId.replace('config:questions_modal_', '');
        const indices = RANGES[part];
        if (!indices) return interaction.reply({ content: '❌ Unknown question set.', flags: MessageFlags.Ephemeral });

        const cfg = client.config;
        const isSuperuser = (cfg.SUPERUSER_IDS || []).map(String).includes(String(interaction.user.id));

        if (interaction.guild.ownerId !== interaction.user.id && !isSuperuser) {
            return interaction.reply({ content: '❌ Only the server owner or superusers can change config.', flags: MessageFlags.Ephemeral });
        }

        const qs = cfg.APP_QUESTIONS ? [...cfg.APP_QUESTIONS] : Array(15).fill('');
        while (qs.length < 15) qs.push('');

        for (const i of indices) {
            const val = interaction.fields.getTextInputValue(`q${i + 1}`)?.trim();
            if (val !== undefined) qs[i] = val;
        }

        cfg.APP_QUESTIONS = qs;

        try {
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 4), 'utf8');
        } catch (err) {
            console.error('Failed to save config:', err);
            return interaction.reply({ content: '❌ Failed to save config to disk.', flags: MessageFlags.Ephemeral });
        }

        await interaction.reply({ content: `✅ Questions updated for **${part.replace('APP_QUESTIONS_', 'Part ')}**.`, flags: MessageFlags.Ephemeral });
    },
};
