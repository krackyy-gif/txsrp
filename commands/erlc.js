const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');

async function prc(path, key) {
    const { data } = await axios.get(`https://api.policeroleplay.community/v1${path}`, {
        headers: { 'Server-Key': key },
        timeout: 10_000,
    });
    return data;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('erlc')
        .setDescription('ER:LC server commands.')
        .addSubcommand(sub => sub.setName('info').setDescription('Show ER:LC server info.')),

    async execute(interaction, client) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'info') {
            await interaction.deferReply();

            const key = client.config.ERLC_SERVER_KEY;
            if (!key) return interaction.editReply('❌ `ERLC_SERVER_KEY` is not set. Use `/config` to add it.');

            try {
                const [server, staff, queue] = await Promise.all([
                    prc('/server', key),
                    prc('/server/staff', key).catch(() => []),
                    prc('/server/queue', key).catch(() => []),
                ]);

                let ownerName = `Unknown (${server.OwnerId ?? 'N/A'})`;
                let ownerLink = '';
                if (server.OwnerId) {
                    const r = await axios.get(`https://users.roblox.com/v1/users/${server.OwnerId}`, { timeout: 5000 }).catch(() => null);
                    if (r?.data?.name) {
                        ownerName = r.data.name;
                        ownerLink = `https://www.roblox.com/users/${server.OwnerId}/profile`;
                    }
                }

                const text = [
                    `# ER:LC Server Info`,
                    `**Server Name:** ${server.Name ?? 'N/A'}`,
                    `**Server Owner:** ${ownerLink ? `[${ownerName}](${ownerLink})` : ownerName}`,
                    `**Join Code:** \`${server.JoinKey ?? 'N/A'}\``,
                    `**Players:** ${server.CurrentPlayers ?? 0}/${server.MaxPlayers ?? 0}`,
                    `**Queue:** ${Array.isArray(queue) ? queue.length : 0}`,
                    `**Staff In-Server:** ${Array.isArray(staff) ? staff.length : 0}`,
                ].join('\n');

                const container = new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(text));
                return interaction.editReply({ flags: MessageFlags.IsComponentsV2, components: [container] });

            } catch (err) {
                const status = err.response?.status;
                if (status === 403) return interaction.editReply('❌ Invalid server key (403). Check via `/config`.');
                if (status === 429) return interaction.editReply('❌ Rate limited by ER:LC API. Try again later.');
                if (status === 404) return interaction.editReply('❌ Server not found (404). Check your server key.');
                return interaction.editReply(`❌ Failed to fetch ER:LC info. (${status ? `HTTP ${status}` : err.message})`);
            }
        }
    },
};
