const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Make the bot send a message in this channel.')
        .addStringOption(o =>
            o.setName('message').setDescription('The message to send.').setRequired(true)
        ),

    async execute(interaction) {
        const roleId = interaction.client.config.SAY_REQUIRED_ROLE_ID;

        if (roleId && !interaction.member.roles.cache.has(roleId)) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', flags: MessageFlags.Ephemeral });
        }

        const message = interaction.options.getString('message');
        await interaction.reply({ content: '✅ Message sent!', flags: MessageFlags.Ephemeral });
        await interaction.channel.send({ content: message });
    },
};
