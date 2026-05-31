const axios = require('axios');

async function getRobloxInfo(userId, interaction, client) {
    if (!client.config.DOCK_API) {
        return { error: 'Dock API key is not configured. Set it with /config → Dock API Key.' };
    }

    try {
        const res = await axios.get('https://api.docksys.xyz/api/v1/public/discord-to-roblox', {
            headers: { Authorization: `Bearer ${client.config.DOCK_API}` },
            params: { discordId: userId, guildId: interaction.guild.id },
        });

        const robloxId = res.data?.data?.robloxId;
        if (!robloxId) return { error: 'No Roblox account linked for this user.' };

        const userRes = await axios.get(`https://users.roblox.com/v1/users/${robloxId}`);

        return { robloxId, username: userRes.data.name };
    } catch (err) {
        console.error('getRobloxInfo error:', err.response?.data || err.message);
        return { error: 'Failed to fetch Roblox info.' };
    }
}

module.exports = { getRobloxInfo };
