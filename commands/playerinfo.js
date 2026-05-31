const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playerinfo')
        .setDescription('Get info about a player in the ER:LC server.')
        .addStringOption(o =>
            o.setName('player').setDescription('Roblox username or PlayerName:Id').setRequired(true)
        ),

    async execute(interaction, client) {
        await interaction.deferReply();

        const key = client.config.ERLC_SERVER_KEY;
        if (!key) return interaction.editReply('❌ `ERLC_SERVER_KEY` is not set in config.');

        const query = interaction.options.getString('player', true).toLowerCase();

        try {
            const res = await axios.get(
                'https://api.policeroleplay.community/v2/server?Players=true&Vehicles=true',
                { headers: { 'server-key': key } }
            );

            const players  = Array.isArray(res.data.Players)  ? res.data.Players  : [];
            const vehicles = Array.isArray(res.data.Vehicles) ? res.data.Vehicles : [];

            const player = players.find(p => {
                const raw      = String(p.Player || '');
                const username = raw.split(':')[0].toLowerCase();
                return raw.toLowerCase() === query || username === query;
            });

            if (!player) return interaction.editReply(`No player found for \`${interaction.options.getString('player', true)}\`.`);

            const raw      = String(player.Player || 'N/A');
            const username = raw.split(':')[0] || 'N/A';
            const userId   = raw.includes(':') ? raw.split(':')[1] : 'N/A';
            const loc      = player.Location || {};

            const playerText = [
                `# ER:LC Player Info`,
                `**Player:** ${username}`,
                `**User ID:** ${userId}`,
                `**Team:** ${player.Team ?? 'N/A'}`,
                `**Callsign:** ${player.Callsign || 'N/A'}`,
                `**Permission:** ${player.Permission ?? 'N/A'}`,
                `**Wanted Stars:** ${player.WantedStars ?? 0}`,
                `**Postal Code:** ${loc.PostalCode || 'N/A'}`,
                `**Street Name:** ${loc.StreetName || 'N/A'}`,
                `**Building Number:** ${loc.BuildingNumber || 'N/A'}`,
            ].join('\n');

            const vehicle     = vehicles.find(v => String(v.Owner || '').toLowerCase() === username.toLowerCase());
            const vehicleText = vehicle
                ? [`# Vehicle Info`, `**Name:** ${vehicle.Name ?? 'N/A'}`, `**Owner:** ${vehicle.Owner ?? 'N/A'}`, `**Texture:** ${vehicle.Texture ?? 'N/A'}`, `**Color:** ${vehicle.ColorName ?? 'N/A'} (${vehicle.ColorHex ?? 'N/A'})`].join('\n')
                : `# Vehicle Info\nNo vehicle found.`;

            await interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [
                    new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(playerText)),
                    new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(vehicleText)),
                ],
            });
        } catch (err) {
            if (err.response?.status === 403) return interaction.editReply('❌ Invalid server key (403).');
            await interaction.editReply('❌ Failed to fetch player info.');
        }
    },
};
