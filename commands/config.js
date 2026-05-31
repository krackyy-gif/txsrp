const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    MessageFlags,
    PermissionFlagsBits,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Configure the bot settings.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const cfg = interaction.client.config;
        const isSuperuser = (cfg.SUPERUSER_IDS || []).map(String).includes(String(interaction.user.id));

        if (interaction.guild.ownerId !== interaction.user.id && !isSuperuser) {
            return interaction.reply({ content: '❌ Only the server owner or a superuser can use `/config`.', flags: MessageFlags.Ephemeral });
        }

        const ch  = (id) => (id ? `<#${id}>` : '`Not set`');
        const rol = (v) => v ? v.split(',').map(r => `<@&${r.trim()}>`).join(', ') : '`Not set`';
        const msk = (v) => v ? `\`${v.slice(0, 6)}${'•'.repeat(Math.min(v.length - 6, 20))}\`` : '`Not set`';
        const su  = (arr) => arr?.length ? arr.map(id => `<@${id}>`).join(', ') : '`None`';

        const embed = new EmbedBuilder()
            .setTitle('⚙️  Bot Configuration')
            .setColor(0x2f3136)
            .addFields(
                {
                    name: '📢  Channels',
                    value: [
                        `**Applications:** ${ch(cfg.APPLICATION_CHANNEL_ID)}`,
                        `**App Results:** ${ch(cfg.APP_RESULT_CHANNEL_ID)}`,
                        `**Promotion Log:** ${ch(cfg.PROMOTION_CHANNEL_ID)}`,
                        `**Infraction Log:** ${ch(cfg.INFRACTION_CHANNEL_ID)}`,
                        `**Output Log:** ${ch(cfg.OUTPUT_LOG_CHANNEL_ID)}`,
                        `**Transcripts:** ${ch(cfg.TRANSCRIPT_CHANNEL_ID)}`,
                    ].join('\n'),
                },
                {
                    name: '🛡️  Permission Roles',
                    value: [
                        `**Promotion:** ${rol(cfg.PROMOTION_PERM_ROLE_ID)}`,
                        `**Infraction:** ${rol(cfg.INFRACTION_PERM_ROLE_ID)}`,
                        `**Say Command:** ${rol(cfg.SAY_REQUIRED_ROLE_ID)}`,
                        `**Ticket Claim:** ${rol(cfg.TICKET_CLAIM_ROLE_ID)}`,
                        `**Ticket Close:** ${rol(cfg.TICKET_CLOSE_ROLE_ID)}`,
                        `**Giveaway Host:** ${rol(cfg.GIVEAWAY_HOST_ROLE_ID)}`,
                    ].join('\n'),
                },
                {
                    name: '📣  Session',
                    value: [
                        `**Channel:** ${ch(cfg.SESSION_CHANNEL_ID)}`,
                        `**Ping Role:** ${rol(cfg.SESSION_ROLE_ID)}`,
                        `**Notification Role:** ${rol(cfg.NOTIFICATION_ROLE_ID)}`,
                    ].join('\n'),
                },
                {
                    name: '⚠️  Infraction Roles',
                    value: [
                        `**Warning 1:** ${rol(cfg.WARNING_1_ROLE_ID)}`,
                        `**Warning 2:** ${rol(cfg.WARNING_2_ROLE_ID)}`,
                        `**Strike 1:** ${rol(cfg.STRIKE_1_ROLE_ID)}`,
                        `**Strike 2:** ${rol(cfg.STRIKE_2_ROLE_ID)}`,
                    ].join('\n'),
                },
                { name: '👑  Superusers', value: su(cfg.SUPERUSER_IDS) },
                { name: '⌨️  Prefix',    value: `\`${cfg.PREFIX || '$'}\``, inline: true },
                { name: '🆔  Guild ID',  value: cfg.GUILD_ID ? `\`${cfg.GUILD_ID}\`` : '`Not set`', inline: true },
                {
                    name: '🔑  API Keys',
                    value: [
                        `**ER:LC Key:** ${msk(cfg.ERLC_SERVER_KEY)}`,
                        `**Dock API:** ${msk(cfg.DOCK_API)}`,
                        `**MongoDB:** ${msk(cfg.MONGOURL)}`,
                    ].join('\n'),
                },
            )
            .setFooter({ text: 'Select an option below to change a setting.' })
            .setTimestamp();

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('config:select')
                .setPlaceholder('What would you like to configure?')
                .addOptions(
                    { label: '📋  Application Channel',         value: 'APPLICATION_CHANNEL_ID' },
                    { label: '📢  App Result Channel',          value: 'APP_RESULT_CHANNEL_ID' },
                    { label: '📢  Promotion Log Channel',       value: 'PROMOTION_CHANNEL_ID' },
                    { label: '📢  Infraction Log Channel',      value: 'INFRACTION_CHANNEL_ID' },
                    { label: '📢  Output Log Channel',          value: 'OUTPUT_LOG_CHANNEL_ID' },
                    { label: '🛡️  Promotion Perm Roles',        value: 'PROMOTION_PERM_ROLE_ID' },
                    { label: '🛡️  Infraction Perm Roles',       value: 'INFRACTION_PERM_ROLE_ID' },
                    { label: '🛡️  Say Required Role',           value: 'SAY_REQUIRED_ROLE_ID' },
                    { label: '🎫  Ticket Transcript Channel',   value: 'TRANSCRIPT_CHANNEL_ID' },
                    { label: '🎫  Ticket Claim Role',           value: 'TICKET_CLAIM_ROLE_ID' },
                    { label: '🎫  Ticket Close Role',           value: 'TICKET_CLOSE_ROLE_ID' },
                    { label: '📣  Session Channel',             value: 'SESSION_CHANNEL_ID' },
                    { label: '📣  Session Ping Role',           value: 'SESSION_ROLE_ID' },
                    { label: '🔔  Session Notification Role',   value: 'NOTIFICATION_ROLE_ID' },
                    { label: '🎉  Giveaway Host Role',          value: 'GIVEAWAY_HOST_ROLE_ID' },
                    { label: '⌨️  Command Prefix',              value: 'PREFIX' },
                    { label: '🔑  ER:LC Server Key',            value: 'ERLC_SERVER_KEY' },
                    { label: '🔑  Dock API Key',                value: 'DOCK_API' },
                    { label: '🔗  MongoDB URL',                 value: 'MONGOURL' },
                    { label: '🆔  Guild ID',                    value: 'GUILD_ID' },
                    { label: '⚠️  Warning 1 Role',              value: 'WARNING_1_ROLE_ID' },
                    { label: '⚠️  Warning 2 Role',              value: 'WARNING_2_ROLE_ID' },
                    { label: '🟠  Strike 1 Role',               value: 'STRIKE_1_ROLE_ID' },
                    { label: '🔴  Strike 2 Role',               value: 'STRIKE_2_ROLE_ID' },
                    { label: '👑  Add Superuser',               value: 'SUPERUSER_ADD' },
                    { label: '👑  Remove Superuser',            value: 'SUPERUSER_REMOVE' },
                ),
        );

        const q = cfg.APP_QUESTIONS || [];
        const qEmbed = new EmbedBuilder()
            .setTitle('📝  Application Questions')
            .setColor(0x2f3136)
            .addFields(
                { name: 'Part 1 (Q1–5)',   value: [1,2,3,4,5].map(i => `**${i}.** ${q[i-1] || '*Not set*'}`).join('\n') },
                { name: 'Part 2 (Q6–10)',  value: [6,7,8,9,10].map(i => `**${i}.** ${q[i-1] || '*Not set*'}`).join('\n') },
                { name: 'Part 3 (Q11–15)', value: [11,12,13,14,15].map(i => `**${i}.** ${q[i-1] || '*Not set*'}`).join('\n') },
            )
            .setFooter({ text: 'Select below to edit application questions.' });

        const questionsMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('config:questions')
                .setPlaceholder('Edit application questions…')
                .addOptions(
                    { label: '📝  Edit Questions 1–5',    value: 'APP_QUESTIONS_1' },
                    { label: '📝  Edit Questions 6–10',   value: 'APP_QUESTIONS_2' },
                    { label: '📝  Edit Questions 11–15',  value: 'APP_QUESTIONS_3' },
                ),
        );

        await interaction.reply({ embeds: [embed, qEmbed], components: [menu, questionsMenu], flags: MessageFlags.Ephemeral });
    },
};
