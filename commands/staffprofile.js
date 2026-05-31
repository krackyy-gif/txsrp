const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { Case } = require('../models/Case');
const { COLORS, FOOTER_TEXT, hasPerm, sendOutputLog } = require('../utils/staffHelpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staffprofile')
        .setDescription('View a staff member\'s full profile: infractions and promotions.')
        .addUserOption(o => o.setName('member').setDescription('Staff member to look up.').setRequired(true)),

    async execute(interaction) {
        if (!hasPerm(interaction)) {
            return interaction.reply({ content: '❌ You do not have permission.', flags: MessageFlags.Ephemeral });
        }

        const target = interaction.options.getMember('member');
        if (!target) return interaction.reply({ content: '❌ Member not found.', flags: MessageFlags.Ephemeral });

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        let infractions = [], promotions = [];
        try {
            [infractions, promotions] = await Promise.all([
                Case.find({ userId: target.id, type: 'infraction', guildId: interaction.guild.id }).sort({ caseNumber: 1 }),
                Case.find({ userId: target.id, type: 'promotion',  guildId: interaction.guild.id }).sort({ caseNumber: 1 }),
            ]);
        } catch {
            return interaction.editReply('❌ Database unavailable. Try again later.');
        }

        const activeInfs  = infractions.filter(i => !i.revoked);
        const revokedInfs = infractions.filter(i =>  i.revoked);

        const embed = new EmbedBuilder()
            .setTitle(`👤  Staff Profile — ${target.user.username}`)
            .setColor(COLORS.PRIMARY)
            .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Discord',   value: `${target}`,                                          inline: true },
                { name: 'Top Role',  value: target.roles.highest ? `${target.roles.highest}` : 'None', inline: true },
                { name: '\u200b',    value: '\u200b',                                              inline: true },
                {
                    name: '📊  Summary',
                    value: `Promotions: **${promotions.length}**\nActive Infractions: **${activeInfs.length}**\nRevoked Infractions: **${revokedInfs.length}**`,
                },
            )
            .setFooter({ text: FOOTER_TEXT })
            .setTimestamp();

        if (promotions.length) {
            const latest = promotions[promotions.length - 1];
            const when   = latest.timestamp ? `<t:${Math.floor(latest.timestamp.getTime() / 1000)}:D>` : 'Unknown';
            embed.addFields({ name: '⬆️  Latest Promotion', value: `**${latest.rankName}** — Case #${latest.caseNumber} — ${when}` });
        }

        if (activeInfs.length) {
            const lines = activeInfs.slice(-5).map(i => {
                const when = i.timestamp ? `<t:${Math.floor(i.timestamp.getTime() / 1000)}:D>` : 'Unknown';
                return `• Case #${i.caseNumber} — **${i.punishment}** (${when})`;
            });
            embed.addFields({ name: '⚠️  Active Infractions (latest 5)', value: lines.join('\n') });
        } else {
            embed.addFields({ name: '✅  Active Infractions', value: 'None — clean record!' });
        }

        await interaction.editReply({ embeds: [embed] });

        await sendOutputLog(interaction.client, {
            action: 'Staff Profile Viewed',
            target: `${target.user.tag} (${target.id})`,
            moderator: interaction.user.tag,
            color: COLORS.INFO,
        });
    },
};
