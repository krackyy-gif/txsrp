const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { COLORS, hasPerm, isSuperuser, getTopRolePosition, sendOutputLog } = require('../utils/staffHelpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removerole')
        .setDescription('Remove a role from a member.')
        .addUserOption(o => o.setName('member').setDescription('Target member.').setRequired(true))
        .addRoleOption(o => o.setName('role').setDescription('The role to remove.').setRequired(true)),

    async execute(interaction) {
        if (!hasPerm(interaction)) {
            return interaction.reply({ content: '❌ You do not have permission.', flags: MessageFlags.Ephemeral });
        }

        const target = interaction.options.getMember('member');
        const role   = interaction.options.getRole('role');

        if (!target) return interaction.reply({ content: '❌ Member not found.', flags: MessageFlags.Ephemeral });

        if (!isSuperuser(interaction.user.id, interaction.client.config)) {
            if (role.position >= getTopRolePosition(interaction.member, interaction.client.config)) {
                return interaction.reply({ content: '❌ You cannot remove a role equal to or higher than your own.', flags: MessageFlags.Ephemeral });
            }
        }
        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ content: '❌ I cannot remove that role — it is higher than my role.', flags: MessageFlags.Ephemeral });
        }

        await target.roles.remove(role);

        await sendOutputLog(interaction.client, {
            action: 'Role Removed',
            target: `${target.user.tag} (${target.id})`,
            moderator: interaction.user.tag,
            detail: role.name,
            color: COLORS.WARNING,
        });

        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(COLORS.WARNING).setDescription(`✅ Removed **${role.name}** from ${target}.`).setTimestamp()],
        });
    },
};
