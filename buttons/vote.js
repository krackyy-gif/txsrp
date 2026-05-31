const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    MessageFlags,
} = require('discord.js');

const REQUIRED_VOTES = 7;
const cooldowns = new Map();

module.exports = {
    customID: 'vote:button',

    async execute(interaction, client) {
        const sessionId  = interaction.customId.split('_')[1];
        const userId     = interaction.user.id;
        const now        = Date.now();
        const cooldownMs = 5000;

        if (cooldowns.has(userId)) {
            const exp = cooldowns.get(userId);
            if (now < exp) {
                return interaction.reply({ content: `You are on **cooldown**, please try again <t:${Math.floor(exp / 1000)}:R>.`, flags: MessageFlags.Ephemeral });
            }
        }
        cooldowns.set(userId, now + cooldownMs);
        setTimeout(() => cooldowns.delete(userId), cooldownMs);

        if (!client.voteMap) client.voteMap = new Map();
        if (!client.voteMap.has(sessionId)) {
            client.voteMap.set(sessionId, new Map());
            client.activePollId = sessionId;
        }

        const votes = client.voteMap.get(sessionId);
        const voted = votes.has(userId);

        if (voted) {
            votes.delete(userId);
        } else {
            votes.set(userId, { userId, timestamp: Date.now() });
        }

        const count = votes.size;

        await interaction.update({
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`vote:button_${sessionId}`).setLabel('Vote').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId(`viewvote:button_${sessionId}`).setLabel(`View Voters (${count})`).setStyle(ButtonStyle.Secondary),
                ),
            ],
        });

        await interaction.followUp({ content: voted ? '✅ Your vote was removed.' : '✅ Your vote was counted!', flags: MessageFlags.Ephemeral });

        if (count === REQUIRED_VOTES) {
            const cfg         = client.config;
            const roleId      = cfg.SESSION_ROLE_ID || '';
            const votersList  = [...votes.values()].map(v => `<@${v.userId}>`).join(', ') || 'No voters';
            const channelId   = cfg.SESSION_CHANNEL_ID;

            const startup = new EmbedBuilder()
                .setColor(0x37373E)
                .setTitle('**Session Startup**')
                .setDescription('> A server start-up has been initiated! Please ensure you have read our regulations prior to joining.');

            await interaction.channel.send({
                content: `${roleId ? `<@&${roleId}>` : ''}\n-# ${votersList}`,
                embeds: [startup],
            });

            await interaction.message.delete().catch(() => {});

            for (const v of votes.values()) {
                const user = await client.users.fetch(v.userId).catch(() => null);
                if (!user) continue;
                await user.send({
                    embeds: [new EmbedBuilder().setColor(0x37373E).setDescription(`Hey <@${v.userId}>, the session has started — please join the game!`)],
                }).catch(() => {});
            }

            client.voteMap.delete(sessionId);
        }
    },
};
