const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { Case, nextCaseNumber } = require('../models/Case');
const {
    COLORS, PUNISHMENT_ICONS, PUNISHMENT_COLORS, PUNISHMENT_TYPES,
    FOOTER_TEXT, hasPerm, isSuperuser, sendOutputLog,
} = require('../utils/staffHelpers');

const TITLE_MAP = {
    'Verbal Warning': '🔵  Verbal Warning',
    'Retirement':     '🎖️  Staff Retirement',
    'Strict Watch':   '👁️  Strict Watch Notice',
    'Termination':    '🚫  Staff Termination',
    'Suspension':     '⛔  Staff Suspension',
};

const DESC_MAP = {
    'Verbal Warning': (t) => `${t} has received a **Verbal Warning**. This is an informal notice.`,
    'Retirement':     (t) => `Thank you for your dedicated service, ${t}. Your contributions have been invaluable.`,
    'Strict Watch':   (t) => `${t} has been placed on **Strict Watch**. Conduct will be closely monitored by leadership.`,
    'Termination':    (t) => `${t} has been **terminated** from the Staff Team.`,
    'Suspension':     (t) => `${t} has been **suspended** from the Staff Team.`,
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('infraction')
        .setDescription('Issue a staff infraction.')
        .addUserOption(o => o.setName('member').setDescription('Staff member receiving the infraction.').setRequired(true))
        .addStringOption(o =>
            o.setName('punishment').setDescription('Type of punishment.').setRequired(true)
             .addChoices(...PUNISHMENT_TYPES.map(p => ({ name: p, value: p })))
        )
        .addStringOption(o => o.setName('reason').setDescription('Reason for the infraction.').setRequired(true))
        .addStringOption(o => o.setName('notes').setDescription('Additional notes.').setRequired(false)),

    async execute(interaction) {
        if (!hasPerm(interaction)) {
            return interaction.reply({ content: '❌ You do not have permission.', flags: MessageFlags.Ephemeral });
        }

        const target = interaction.options.getMember('member');
        if (!target) return interaction.reply({ content: '❌ Member not found.', flags: MessageFlags.Ephemeral });
        if (target.id === interaction.user.id) return interaction.reply({ content: '❌ You cannot infract yourself.', flags: MessageFlags.Ephemeral });

        if (!isSuperuser(interaction.user.id, interaction.client.config)) {
            if (target.roles.highest.position >= interaction.member.roles.highest.position) {
                return interaction.reply({ content: '❌ You cannot infract someone with the same or higher rank.', flags: MessageFlags.Ephemeral });
            }
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const punishment = interaction.options.getString('punishment');
        const reason     = interaction.options.getString('reason');
        const notes      = interaction.options.getString('notes') || 'None';
        const color      = PUNISHMENT_COLORS[punishment] || COLORS.DANGER;
        const icon       = PUNISHMENT_ICONS[punishment]  || '⚠️';

        const caseNum = await nextCaseNumber().catch(() => null);
        if (caseNum) {
            await Case.create({
                caseNumber: caseNum, type: 'infraction',
                userId: target.id, username: target.user.username,
                guildId: interaction.guild.id,
                punishment, reason, notes,
                issuedBy: interaction.user.tag, issuedById: interaction.user.id,
            }).catch(console.error);
        }

        const title = TITLE_MAP[punishment] || `${icon}  Staff Infraction — ${punishment}`;
        const desc  = (DESC_MAP[punishment]?.(target)) || `${target} has received a formal infraction.`;

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(`━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${desc}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
            .setColor(color)
            .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
            .setAuthor({ name: target.user.username, iconURL: target.user.displayAvatarURL({ dynamic: true }) })
            .addFields(
                { name: '👤  Staff Member',    value: `${target}`,                              inline: true },
                { name: `${icon}  Punishment`, value: `**${punishment}**`,                      inline: true },
                { name: '📋  Case',            value: caseNum ? `\`#${caseNum}\`` : 'N/A',      inline: true },
                { name: '📝  Reason',          value: reason,                                   inline: false },
                { name: '🗒️  Notes',           value: notes,                                    inline: false },
            )
            .setFooter({ text: `Issued by: ${interaction.user.tag} • ${FOOTER_TEXT}` })
            .setTimestamp();

        const cfg = interaction.client.config;
        const roleMap = {
            'Warning 1': cfg.WARNING_1_ROLE_ID,
            'Warning 2': cfg.WARNING_2_ROLE_ID,
            'Strike 1':  cfg.STRIKE_1_ROLE_ID,
            'Strike 2':  cfg.STRIKE_2_ROLE_ID,
        };
        const roleIdToAssign = roleMap[punishment];
        if (roleIdToAssign) {
            const allRoles = Object.values(roleMap).filter(Boolean);
            const toRemove = allRoles.filter(id => id !== roleIdToAssign && target.roles.cache.has(id));
            if (toRemove.length) await target.roles.remove(toRemove).catch(console.error);
            await target.roles.add(roleIdToAssign).catch(console.error);
        }

        let msg;
        if (cfg.INFRACTION_CHANNEL_ID) {
            const ch = interaction.client.channels.cache.get(cfg.INFRACTION_CHANNEL_ID)
                || await interaction.client.channels.fetch(cfg.INFRACTION_CHANNEL_ID).catch(() => null);
            if (ch) msg = await ch.send({ content: `${target}`, embeds: [embed] });
        } else {
            msg = await interaction.channel.send({ embeds: [embed] });
        }
        if (msg) await msg.startThread({ name: `Evidence — Case #${caseNum || 'N/A'}` }).catch(() => {});

        await target.send({
            embeds: [new EmbedBuilder()
                .setTitle(`${icon}  Staff Infraction — ${punishment}`)
                .setColor(color)
                .addFields(
                    { name: `${icon}  Punishment`, value: `**${punishment}**`, inline: true },
                    { name: '📋  Case',            value: caseNum ? `\`#${caseNum}\`` : 'N/A', inline: true },
                    { name: '📝  Reason',          value: reason, inline: false },
                    { name: '🗒️  Notes',           value: notes,  inline: false },
                )
                .setFooter({ text: FOOTER_TEXT })
                .setTimestamp()],
        }).catch(() => {});

        await sendOutputLog(interaction.client, {
            action: 'Infraction Issued', target: `${target.user.tag} (${target.id})`,
            moderator: interaction.user.tag,
            detail: `Punishment: ${punishment}${caseNum ? ` | Case: #${caseNum}` : ''} | Reason: ${reason}`,
            color,
        });

        await interaction.editReply(`✅ Infraction issued to ${target} — **${punishment}**${caseNum ? ` — Case \`#${caseNum}\`` : ''}.`);
    },
};
