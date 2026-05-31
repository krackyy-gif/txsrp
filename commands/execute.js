const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');
const { hasPerm } = require('../utils/staffHelpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('execute')
        .setDescription('Execute an ER:LC server command.')
        .addStringOption(o =>
            o.setName('command').setDescription('Command to run (e.g. :h Hello)').setRequired(true)
        ),

    async execute(interaction, client) {
        if (!hasPerm(interaction)) {
            return interaction.reply({ content: '❌ You do not have permission.', flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const command = interaction.options.getString('command', true);
        const key = client.config.ERLC_SERVER_KEY;

        if (!key) return interaction.editReply('❌ `ERLC_SERVER_KEY` is not set in config.');

        try {
            await axios.post(
                'https://api.policeroleplay.community/v1/server/command',
                { command },
                { headers: { 'server-key': key, 'Content-Type': 'application/json' } }
            );
            await interaction.editReply(`✅ Executed: \`${command}\``);
        } catch (err) {
            if (err.response?.status === 403) return interaction.editReply('❌ Invalid server key or no permission.');
            if (err.response?.status === 400) return interaction.editReply('❌ Invalid command format.');
            await interaction.editReply('❌ Failed to execute command.');
        }
    },
};
