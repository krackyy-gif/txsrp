const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'rename',
    aliases: ['rn'],

    async execute(message, args, client) {
        if (!message.channel.name.endsWith('-ticket')) {
            return message.reply('❌ This command can only be used inside a ticket channel.');
        }

        const roleId = client.config.TICKET_CLAIM_ROLE_ID;
        if (roleId && !message.member.roles.cache.has(roleId)) {
            return message.reply('❌ You do not have permission to rename ticket channels.');
        }

        const newName = args.join('-').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 90);

        if (!newName) {
            return message.reply(`❌ Please provide a new name. Usage: \`${client.config.PREFIX || '$'}rename new-name\``);
        }

        const oldName = message.channel.name;

        await message.channel.setName(`${newName}-ticket`, `Renamed by ${message.author.tag}`);
        await message.reply(`✅ Channel renamed from \`${oldName}\` to \`${newName}-ticket\`.`);
    },
};
