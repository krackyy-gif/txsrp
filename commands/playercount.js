const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playercount')
        .setDescription('Get the ER:LC server player count.'),

    async execute(interaction, client) {
        await interaction.deferReply();

        const key = client.config.ERLC_SERVER_KEY;
        if (!key) return interaction.editReply('❌ `ERLC_SERVER_KEY` is not set in config.');

        try {
            const headers = { 'server-key': key };
            const [serverRes, queueRes] = await Promise.all([
                axios.get('https://api.policeroleplay.community/v1/server', { headers }),
                axios.get('https://api.policeroleplay.community/v1/server/queue', { headers }),
            ]);

            const players = serverRes.data.CurrentPlayers ?? 0;
            const max     = serverRes.data.MaxPlayers   ?? 0;
            const queue   = Array.isArray(queueRes.data) ? queueRes.data.length : 0;

            const container = new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `# ERLC Server Status\n**Players:** ${players}/${max}\n**Queue:** ${queue}`
                )
            );

            await interaction.editReply({ flags: MessageFlags.IsComponentsV2, components: [container] });
        } catch (err) {
            if (err.response?.status === 403) return interaction.editReply('❌ Invalid server key (403).');
            await interaction.editReply('❌ Failed to fetch player count.');
        }
    },
};
