const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
    PermissionFlagsBits,
} = require('discord.js');
const mongoose = require('mongoose');

const CHANNEL_KEYS = [
    { key: 'APPLICATION_CHANNEL_ID', label: 'Application Channel' },
    { key: 'PROMOTION_CHANNEL_ID',   label: 'Promotion Log Channel' },
    { key: 'INFRACTION_CHANNEL_ID',  label: 'Infraction Log Channel' },
    { key: 'OUTPUT_LOG_CHANNEL_ID',  label: 'Output Log Channel' },
    { key: 'TRANSCRIPT_CHANNEL_ID',  label: 'Ticket Transcript Channel' },
    { key: 'SESSION_CHANNEL_ID',     label: 'Session Channel' },
];

const ROLE_KEYS = [
    { key: 'PROMOTION_PERM_ROLE_ID',  label: 'Promotion Perm Roles', multi: true },
    { key: 'INFRACTION_PERM_ROLE_ID', label: 'Infraction Perm Roles', multi: true },
    { key: 'SAY_REQUIRED_ROLE_ID',    label: 'Say Required Role', multi: false },
    { key: 'TICKET_CLAIM_ROLE_ID',    label: 'Ticket Claim Role', multi: false },
    { key: 'TICKET_CLOSE_ROLE_ID',    label: 'Ticket Close Role', multi: false },
    { key: 'SESSION_ROLE_ID',         label: 'Session Ping Role', multi: false },
    { key: 'NOTIFICATION_ROLE_ID',    label: 'Notification Role', multi: false },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fix')
        .setDescription('Run diagnostics and check the bot configuration.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        const cfg = client.config;
        const isOwner     = interaction.guild.ownerId === interaction.user.id;
        const isSuperuser = (cfg.SUPERUSER_IDS || []).map(String).includes(String(interaction.user.id));

        if (!isOwner && !isSuperuser) {
            return interaction.reply({ content: '❌ Only the server owner or superusers can use `/fix`.', flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const results = [];

        for (const key of ['TOKEN', 'APP_ID', 'GUILD_ID']) {
            results.push({ label: key, status: cfg[key] ? '✅' : '❌', detail: cfg[key] ? 'Set' : 'Missing — set via /config' });
        }

        const dbState  = mongoose.connection.readyState;
        const dbLabels = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };
        results.push({ label: 'MongoDB', status: dbState === 1 ? '✅' : '⚠️', detail: dbLabels[dbState] || 'Unknown' });

        const channelChecks = await Promise.all(CHANNEL_KEYS.map(async ({ key, label }) => {
            const id = cfg[key];
            if (!id) return { label, status: '➖', detail: 'Not configured' };
            try {
                await client.channels.fetch(id);
                return { label, status: '✅', detail: `<#${id}>` };
            } catch {
                return { label, status: '❌', detail: `ID \`${id}\` not found` };
            }
        }));
        results.push(...channelChecks);

        const roleChecks = await Promise.all(ROLE_KEYS.map(async ({ key, label, multi }) => {
            const val = cfg[key];
            if (!val) return { label, status: '➖', detail: 'Not configured' };
            const ids = multi ? val.split(',').map(r => r.trim()).filter(Boolean) : [val.trim()];
            const missing = [];
            for (const id of ids) {
                const exists = interaction.guild.roles.cache.has(id)
                    || await interaction.guild.roles.fetch(id).then(() => true).catch(() => false);
                if (!exists) missing.push(id);
            }
            if (!missing.length) return { label, status: '✅', detail: ids.map(id => `<@&${id}>`).join(', ') };
            return { label, status: '❌', detail: `Role(s) not found: ${missing.map(id => `\`${id}\``).join(', ')}` };
        }));
        results.push(...roleChecks);

        const neededPerms = [
            [PermissionFlagsBits.ManageChannels, 'Manage Channels'],
            [PermissionFlagsBits.ManageRoles,    'Manage Roles'],
            [PermissionFlagsBits.SendMessages,   'Send Messages'],
            [PermissionFlagsBits.EmbedLinks,     'Embed Links'],
        ];
        for (const [bit, name] of neededPerms) {
            const has = interaction.guild.members.me.permissions.has(bit);
            results.push({ label: `Bot: ${name}`, status: has ? '✅' : '❌', detail: has ? 'Granted' : 'Missing — grant to bot role' });
        }

        const ok   = results.filter(r => r.status === '✅').length;
        const warn = results.filter(r => r.status === '⚠️').length;
        const fail = results.filter(r => r.status === '❌').length;
        const skip = results.filter(r => r.status === '➖').length;

        const overallColor = fail > 0 ? 0xDC3232 : warn > 0 ? 0xFFB400 : 0x00D278;
        const overallTitle = fail > 0
            ? `❌  Diagnostics — ${fail} issue${fail !== 1 ? 's' : ''} found`
            : warn > 0 ? `⚠️  Diagnostics — ${warn} warning${warn !== 1 ? 's' : ''}` : '✅  Diagnostics — All systems healthy';

        const fields = [];
        for (let i = 0; i < results.length; i += 10) {
            const chunk = results.slice(i, i + 10);
            fields.push({
                name: i === 0 ? 'Check Results' : '\u200b',
                value: chunk.map(r => `${r.status} **${r.label}** — ${r.detail}`).join('\n'),
            });
        }
        fields.push({ name: 'Summary', value: `✅ ${ok} · ⚠️ ${warn} · ❌ ${fail} · ➖ ${skip}` });

        const embed = new EmbedBuilder()
            .setTitle(overallTitle)
            .setColor(overallColor)
            .addFields(fields)
            .setFooter({ text: 'Use /config to fix misconfigured values.' })
            .setTimestamp();

        await interaction.editReply({
            embeds: [embed],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('fix:resync').setLabel('Re-sync Slash Commands').setStyle(ButtonStyle.Primary)
                ),
            ],
        });
    },
};
