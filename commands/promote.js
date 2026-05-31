const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { Case, nextCaseNumber } = require('../models/Case');
const { COLORS, FOOTER_TEXT, hasPerm, isSuperuser, getTopRolePosition, sendOutputLog } = require('../utils/staffHelpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('promote')
        .setDescription('Issue a staff promotion.')
        .addUserOption(o => o.setName('member').setDescription('Staff member to promote.').setRequired(true))
        .addRoleOption(o => o.setName('rank').setDescription('New rank role.').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Reason for promotion.').setRequired(true))
        .addStringOption(o => o.setName('notes').setDescription('Additional notes.').setRequired(false)),

    async execute(interaction) {
        if (!hasPerm(interaction)) {
            return interaction.reply({ content: '❌ You do not have permission.', flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const target = interaction.options.getMember('member');
        const rank   = interaction.options.getRole('rank');
        const reason = interaction.options.getString('reason');
        const notes  = interaction.options.getString('notes') || 'None';

        if (!target) return interaction.editReply('❌ Member not found.');

        if (!isSuperuser(interaction.user.id, interaction.client.config)) {
            if (rank.position >= getTopRolePosition(interaction.member, interaction.client.config)) {
                return interaction.editReply('❌ You cannot promote to a role equal to or higher than your own.');
            }
        }
        if (rank.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.editReply('❌ I cannot assign that role — it is higher than my role.');
        }

        await target.roles.add(rank, reason);

        const caseNum = await nextCaseNumber().catch(() => null);
        if (caseNum) {
            await Case.create({
                caseNumber: caseNum, type: 'promotion',
                userId: target.id, username: target.user.username,
                guildId: interaction.guild.id,
                rankName: rank.name, rankId: rank.id,
                reason, notes,
                issuedBy: interaction.user.tag, issuedById: interaction.user.id,
            }).catch(console.error);
        }

        const embed = new EmbedBuilder()
            .setTitle('🎉  Staff Promotion')
            .setDescription(
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `Congratulations ${target} on your promotion!\n` +
                `Your hard work and dedication have been recognised by leadership.\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━`
            )
            .setColor(COLORS.GOLD)
            .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '👤  Staff Member', value: `${target}`,                              inline: true },
                { name: '⬆️  New Rank',     value: `${rank}`,                                inline: true },
                { name: '📋  Case',         value: caseNum ? `\`#${caseNum}\`` : 'N/A',      inline: true },
                { name: '📝  Reason',       value: reason,                                   inline: false },
                { name: '🗒️  Notes',        value: notes,                                    inline: false },
            )
            .setFooter({ text: `Issued by: ${interaction.user.tag} • ${FOOTER_TEXT}` })
            .setTimestamp();

        const cfg = interaction.client.config;
        if (cfg.PROMOTION_CHANNEL_ID) {
            const ch = interaction.client.channels.cache.get(cfg.PROMOTION_CHANNEL_ID)
                || await interaction.client.channels.fetch(cfg.PROMOTION_CHANNEL_ID).catch(() => null);
            if (ch) await ch.send({ content: `${target}`, embeds: [embed] });
        } else {
            await interaction.channel.send({ embeds: [embed] });
        }

        await target.send({
            embeds: [new EmbedBuilder()
                .setTitle('🎉  You\'ve Been Promoted!')
                .setDescription('You have been promoted. Your dedication has not gone unnoticed!')
                .setColor(COLORS.GOLD)
                .addFields(
                    { name: '⬆️  New Rank', value: rank.name, inline: true },
                    { name: '📋  Case',     value: caseNum ? `\`#${caseNum}\`` : 'N/A', inline: true },
                    { name: '📝  Reason',   value: reason, inline: false },
                )
                .setFooter({ text: FOOTER_TEXT })
                .setTimestamp()],
        }).catch(() => {});

        await sendOutputLog(interaction.client, {
            action: 'Promotion Issued', target: `${target.user.tag} (${target.id})`,
            moderator: interaction.user.tag,
            detail: `Rank: ${rank.name}${caseNum ? ` | Case: #${caseNum}` : ''} | Reason: ${reason}`,
            color: COLORS.GOLD,
        });

        await interaction.editReply(`✅ Promoted ${target} to **${rank.name}**${caseNum ? ` — Case \`#${caseNum}\`` : ''}.`);
    },
};
