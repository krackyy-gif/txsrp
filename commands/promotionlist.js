const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { Case } = require('../models/Case');
const { COLORS, FOOTER_TEXT, hasPerm } = require('../utils/staffHelpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('promotionlist')
        .setDescription('List all promotions for a staff member.')
        .addUserOption(o => o.setName('member').setDescription('Staff member to look up.').setRequired(true)),

    async execute(interaction) {
        if (!hasPerm(interaction)) {
            return interaction.reply({ content: '❌ You do not have permission.', flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const target = interaction.options.getUser('member');

        let records;
        try {
            records = await Case.find({ userId: target.id, type: 'promotion', guildId: interaction.guild.id }).sort({ caseNumber: 1 });
        } catch {
            return interaction.editReply('❌ Database unavailable. Try again later.');
        }

        if (!records.length) {
            return interaction.editReply(`${target} has no promotions on record.`);
        }

        const embed = new EmbedBuilder()
            .setTitle(`🎉  Promotions — ${target.username}`)
            .setColor(COLORS.GOLD)
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: FOOTER_TEXT })
            .setTimestamp();

        for (const rec of records) {
            const when = rec.timestamp ? `<t:${Math.floor(rec.timestamp.getTime() / 1000)}:D>` : 'Unknown';
            embed.addFields({
                name: `Case #${rec.caseNumber} — ${rec.rankName}`,
                value: `**Reason:** ${rec.reason}\n**Notes:** ${rec.notes || 'None'}\n**By:** ${rec.issuedBy} · **Date:** ${when}`,
            });
        }

        await interaction.editReply({ embeds: [embed] });
    },
};
