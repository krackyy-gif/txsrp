const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { COLORS, hasPerm, isSuperuser, getTopRolePosition, sendOutputLog } = require('../utils/staffHelpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giverole')
        .setDescription('Give a role to a member.')
        .addUserOption(o => o.setName('member').setDescription('Target member.').setRequired(true))
        .addRoleOption(o => o.setName('role').setDescription('The role to give.').setRequired(true)),

    async execute(interaction) {
        if (!hasPerm(interaction)) {
            return interaction.reply({ content: '❌ You do not have permission.', flags: MessageFlags.Ephemeral });
        }

        const target = interaction.options.getMember('member');
        const role   = interaction.options.getRole('role');

        if (!target) return interaction.reply({ content: '❌ Member not found.', flags: MessageFlags.Ephemeral });

        if (!isSuperuser(interaction.user.id, interaction.client.config)) {
            if (role.position >= getTopRolePosition(interaction.member, interaction.client.config)) {
                return interaction.reply({ content: '❌ You cannot give a role equal to or higher than your own.', flags: MessageFlags.Ephemeral });
            }
        }
        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ content: '❌ I cannot assign that role — it is higher than my role.', flags: MessageFlags.Ephemeral });
        }

        await target.roles.add(role);

        await sendOutputLog(interaction.client, {
            action: 'Role Given',
            target: `${target.user.tag} (${target.id})`,
            moderator: interaction.user.tag,
            detail: role.name,
            color: COLORS.SUCCESS,
        });

        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(COLORS.SUCCESS).setDescription(`✅ Gave **${role.name}** to ${target}.`).setTimestamp()],
        });
    },
};
