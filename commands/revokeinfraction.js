const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { Case } = require('../models/Case');
const { COLORS, FOOTER_TEXT, hasPerm, sendOutputLog } = require('../utils/staffHelpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('revokeinfraction')
        .setDescription('Revoke a staff infraction by case number.')
        .addIntegerOption(o =>
            o.setName('case_number').setDescription('Case number to revoke.').setRequired(true)
        ),

    async execute(interaction) {
        if (!hasPerm(interaction)) {
            return interaction.reply({ content: '❌ You do not have permission.', flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const caseNum = interaction.options.getInteger('case_number');

        let record;
        try {
            record = await Case.findOne({ caseNumber: caseNum, type: 'infraction' });
        } catch {
            return interaction.editReply('❌ Database unavailable. Try again later.');
        }

        if (!record) return interaction.editReply(`❌ No infraction found with case number **#${caseNum}**.`);
        if (record.revoked) return interaction.editReply(`❌ Case **#${caseNum}** has already been revoked.`);

        record.revoked = true;
        await record.save().catch(console.error);

        let targetName = record.username;
        try {
            const user = await interaction.client.users.fetch(record.userId);
            targetName = user.tag;
        } catch {}

        await sendOutputLog(interaction.client, {
            action: 'Infraction Revoked',
            target: `${targetName} (${record.userId})`,
            moderator: interaction.user.tag,
            detail: `Case #${caseNum} — ${record.punishment}`,
            color: COLORS.SUCCESS,
        });

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('✅  Infraction Revoked')
                    .setColor(COLORS.SUCCESS)
                    .addFields(
                        { name: 'Case',         value: `#${caseNum}`,         inline: true },
                        { name: 'Punishment',   value: record.punishment,     inline: true },
                        { name: 'Staff Member', value: targetName,            inline: true },
                        { name: 'Revoked By',   value: `${interaction.user}`, inline: true },
                    )
                    .setFooter({ text: FOOTER_TEXT })
                    .setTimestamp(),
            ],
        });
    },
};
