const { MessageFlags } = require('discord.js');

const cooldowns = new Map();

module.exports = {
    customID: 'sessionsRole:button',

    async execute(interaction) {
        const userId     = interaction.user.id;
        const now        = Date.now();
        const cooldownMs = 5000;

        if (cooldowns.has(userId)) {
            const expiresAt = cooldowns.get(userId);
            if (now < expiresAt) {
                return interaction.reply({
                    content: `You are on **cooldown**, please try again <t:${Math.floor(expiresAt / 1000)}:R>.`,
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
        cooldowns.set(userId, now + cooldownMs);
        setTimeout(() => cooldowns.delete(userId), cooldownMs);

        const roleId = interaction.client.config.SESSION_ROLE_ID;
        if (!roleId) {
            return interaction.reply({ content: '❌ Sessions role is not configured. Use `/config` to set it.', flags: MessageFlags.Ephemeral });
        }

        const role = await interaction.guild.roles.fetch(roleId).catch(() => null);
        if (!role) return interaction.reply({ content: '❌ Sessions role not found.', flags: MessageFlags.Ephemeral });

        const { member } = interaction;
        if (member.roles.cache.has(roleId)) {
            await member.roles.remove(role);
            await interaction.reply({ content: `**@${member.user.username}**, you will no longer be notified for sessions.`, flags: MessageFlags.Ephemeral });
        } else {
            await member.roles.add(role);
            await interaction.reply({ content: `**@${member.user.username}**, you will now be notified for sessions.`, flags: MessageFlags.Ephemeral });
        }
    },
};
