const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
} = require('discord.js');
const crypto = require('crypto');
const { hasPerm } = require('../utils/staffHelpers');

const SESSION_CONFIG = {
    SERVER_NAME:    '',
    SERVER_OWNER:   '',
    JOIN_CODE:      '',
    HEADER_IMAGE:   '',
    FOOTER_IMAGE:   '',
    QUICK_JOIN_URL: '',
    VOTE_EMOJI:     '✅',
    VIEW_EMOJI:     '👥',
    ROLE_EMOJI:     '🔔',
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('session')
        .setDescription('Session management.')
        .addSubcommand(sub => sub.setName('startup').setDescription('Host a session startup.'))
        .addSubcommand(sub => sub.setName('shutdown').setDescription('Host a session shutdown.'))
        .addSubcommand(sub => sub.setName('vote').setDescription('Host a session vote.'))
        .addSubcommand(sub => sub.setName('boost').setDescription('Send a session boost ping.'))
        .addSubcommand(sub => sub.setName('full').setDescription('Send the session full embed.')),

    async execute(interaction, client) {
        if (!hasPerm(interaction)) {
            return interaction.reply({ content: '❌ You do not have permission.', flags: MessageFlags.Ephemeral });
        }

        const sub  = interaction.options.getSubcommand();
        const cfg  = client.config;
        const sessionChannelId     = cfg.SESSION_CHANNEL_ID;
        const sessionRoleId        = cfg.SESSION_ROLE_ID;
        const notificationRoleId   = cfg.NOTIFICATION_ROLE_ID;

        const getChannel = async () => sessionChannelId
            ? interaction.guild.channels.fetch(sessionChannelId).catch(() => interaction.channel)
            : interaction.channel;

        const makeEmbeds = (mainEmbed) => SESSION_CONFIG.HEADER_IMAGE
            ? [new EmbedBuilder().setColor(0x37373E).setImage(SESSION_CONFIG.HEADER_IMAGE), mainEmbed]
            : [mainEmbed];

        if (sub === 'startup') {
            const voters = client.activePollId ? client.voteMap?.get(client.activePollId) : null;
            const votersList = voters?.size > 0
                ? [...voters.values()].map(v => `<@${v.userId}>`).join(', ')
                : '**No prior voters**';

            const embed = new EmbedBuilder()
                .setColor(0x37373E)
                .setTitle('**Session Startup**')
                .setDescription(
                    '> A server start-up has been initiated! Please ensure you have read and understood our regulations prior to joining.\n\n' +
                    '**Game Information**\n' +
                    `> **Server Name**: ${SESSION_CONFIG.SERVER_NAME || 'N/A'}\n` +
                    `> **Server Owner**: ${SESSION_CONFIG.SERVER_OWNER || 'N/A'}\n` +
                    `> **Join Code**: ${SESSION_CONFIG.JOIN_CODE || 'N/A'}`
                );
            if (SESSION_CONFIG.FOOTER_IMAGE) embed.setImage(SESSION_CONFIG.FOOTER_IMAGE);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Quick Join')
                    .setURL(SESSION_CONFIG.QUICK_JOIN_URL || 'https://policeroleplay.community')
                    .setStyle(ButtonStyle.Link)
            );

            const channel = await getChannel();
            await channel.send({
                content: `${sessionRoleId ? `<@&${sessionRoleId}>` : ''}\n-# ${votersList}`,
                embeds: makeEmbeds(embed),
                components: [row],
            });

            return interaction.reply({ content: '✅ Session startup posted.', flags: MessageFlags.Ephemeral });
        }

        if (sub === 'shutdown') {
            const embed = new EmbedBuilder()
                .setColor(0x37373E)
                .setTitle('Session Shutdown')
                .setDescription(
                    `> The in-game server is currently on shutdown. Please refrain from attempting to join. ` +
                    `Be sure to obtain the ${notificationRoleId ? `<@&${notificationRoleId}>` : 'sessions'} role to be notified for the next session!`
                );
            if (SESSION_CONFIG.FOOTER_IMAGE) embed.setImage(SESSION_CONFIG.FOOTER_IMAGE);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('sessionsRole:button')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(SESSION_CONFIG.ROLE_EMOJI)
            );

            const channel = await getChannel();
            await channel.send({ embeds: makeEmbeds(embed), components: [row] });
            return interaction.reply({ content: '✅ Session shutdown posted.', flags: MessageFlags.Ephemeral });
        }

        if (sub === 'vote') {
            const pollId = crypto.randomBytes(6).toString('hex');

            const embed = new EmbedBuilder()
                .setColor(0x37373E)
                .setTitle('Session Vote')
                .setDescription('> Please cast your vote below for the upcoming session. If you vote, you are committing to join.');
            if (SESSION_CONFIG.FOOTER_IMAGE) embed.setImage(SESSION_CONFIG.FOOTER_IMAGE);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`vote:button_${pollId}`)
                    .setEmoji(SESSION_CONFIG.VOTE_EMOJI)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`viewvote:button_${pollId}`)
                    .setLabel('View Voters (0)')
                    .setEmoji(SESSION_CONFIG.VIEW_EMOJI)
                    .setStyle(ButtonStyle.Secondary),
            );

            const channel = sessionChannelId
                ? await client.channels.fetch(sessionChannelId).catch(() => interaction.channel)
                : interaction.channel;

            await channel.send({
                content: sessionRoleId ? `<@&${sessionRoleId}>` : '@here',
                embeds: makeEmbeds(embed),
                components: [row],
            });

            return interaction.reply({ content: '✅ Session vote posted.', flags: MessageFlags.Ephemeral });
        }

        if (sub === 'boost') {
            const embed = new EmbedBuilder()
                .setColor(0x37373E)
                .setTitle('Session Boost')
                .setDescription('> The in-game server count is currently **low**. Join up to skip the queue and participate!');
            if (SESSION_CONFIG.FOOTER_IMAGE) embed.setImage(SESSION_CONFIG.FOOTER_IMAGE);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Quick Join')
                    .setURL(SESSION_CONFIG.QUICK_JOIN_URL || 'https://policeroleplay.community')
                    .setStyle(ButtonStyle.Link)
            );

            const channel = await getChannel();
            await channel.send({
                content: sessionRoleId ? `<@&${sessionRoleId}>` : '@here',
                embeds: makeEmbeds(embed),
                components: [row],
            });
            return interaction.reply({ content: '✅ Session boost posted.', flags: MessageFlags.Ephemeral });
        }

        if (sub === 'full') {
            const embed = new EmbedBuilder()
                .setColor(0x37373E)
                .setTitle('Session Full')
                .setDescription('> The server is currently **full**. Please wait for a spot to open up.');
            if (SESSION_CONFIG.FOOTER_IMAGE) embed.setImage(SESSION_CONFIG.FOOTER_IMAGE);

            const channel = await getChannel();
            await channel.send({ embeds: makeEmbeds(embed) });
            return interaction.reply({ content: '✅ Session full embed posted.', flags: MessageFlags.Ephemeral });
        }
    },
};
