const { EmbedBuilder } = require('discord.js');

const COLORS = {
    PRIMARY:   0xFF8C14,
    GOLD:      0xFFC832,
    SUCCESS:   0x00D278,
    WARNING:   0xFFB400,
    DANGER:    0xDC3232,
    INFO:      0x3CAAFF,
    SEV_LOW:   0x64B4FF,
    SEV_MED:   0xFFB400,
    SEV_HIGH:  0xFF641E,
    SEV_CRIT:  0xDC3232,
    SEV_TERM:  0x8C143C,
    SEV_SPEC:  0xA032DC,
};

const PUNISHMENT_ICONS = {
    'Verbal Warning':      '🔵',
    'Warning 1':           '⚠️',
    'Warning 2':           '⚠️',
    'Strike 1':            '🟠',
    'Strike 2':            '🔴',
    'Strict Watch':        '👁️',
    'Under Investigation': '🔍',
    'Suspension':          '⛔',
    'Demotion':            '📉',
    'Termination':         '🚫',
    'Retirement':          '🎖️',
};

const PUNISHMENT_COLORS = {
    'Verbal Warning':      COLORS.SEV_LOW,
    'Warning 1':           COLORS.SEV_MED,
    'Warning 2':           COLORS.WARNING,
    'Strike 1':            COLORS.SEV_HIGH,
    'Strike 2':            COLORS.DANGER,
    'Under Investigation': COLORS.SEV_SPEC,
    'Suspension':          COLORS.DANGER,
    'Demotion':            COLORS.SEV_TERM,
    'Termination':         COLORS.SEV_TERM,
    'Retirement':          COLORS.PRIMARY,
    'Strict Watch':        COLORS.SEV_SPEC,
};

const PUNISHMENT_TYPES = Object.keys(PUNISHMENT_ICONS);
const FOOTER_TEXT = 'Staff Management';

function hasPerm(interaction) {
    const cfg = interaction.client.config;
    if (isSuperuser(interaction.user.id, cfg)) return true;

    const roles = interaction.member.roles.cache;

    const promoRoles = (cfg.PROMOTION_PERM_ROLE_ID || '')
        .split(',').map(r => r.trim()).filter(Boolean);
    const infraRoles = (cfg.INFRACTION_PERM_ROLE_ID || '')
        .split(',').map(r => r.trim()).filter(Boolean);

    return promoRoles.some(id => roles.has(id))
        || infraRoles.some(id => roles.has(id));
}

function isSuperuser(userId, config) {
    return (config.SUPERUSER_IDS || []).map(String).includes(String(userId));
}

function getTopRolePosition(member, config) {
    if (isSuperuser(member.id, config)) return 99999;
    return Math.max(...member.roles.cache.map(r => r.position), 0);
}

async function sendOutputLog(client, { action, target, moderator, reason, detail, color }) {
    const channelId = client.config.OUTPUT_LOG_CHANNEL_ID;
    if (!channelId) return;

    try {
        const channel = client.channels.cache.get(channelId)
            || await client.channels.fetch(channelId).catch(() => null);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setTitle(`📋  ${action}`)
            .setColor(color || COLORS.PRIMARY)
            .setFooter({ text: FOOTER_TEXT })
            .setTimestamp();

        if (target)    embed.addFields({ name: 'Target',    value: String(target),    inline: true });
        if (moderator) embed.addFields({ name: 'Moderator', value: String(moderator), inline: true });
        if (reason)    embed.addFields({ name: 'Reason',    value: String(reason),    inline: false });
        if (detail)    embed.addFields({ name: 'Detail',    value: String(detail),    inline: false });

        await channel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Output log error:', err);
    }
}

module.exports = {
    COLORS,
    PUNISHMENT_ICONS,
    PUNISHMENT_COLORS,
    PUNISHMENT_TYPES,
    FOOTER_TEXT,
    hasPerm,
    isSuperuser,
    getTopRolePosition,
    sendOutputLog,
};
