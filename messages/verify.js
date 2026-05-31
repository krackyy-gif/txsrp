const {
    ContainerBuilder,
    TextDisplayBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
} = require('discord.js');

module.exports = {
    name: 'verify',
    aliases: [],

    async execute(message, args, client) {
        if (message.channel.type !== 0) return;

        const dockApi = client.config.DOCK_API;

        if (!dockApi) {
            return message.reply('❌ Verification is not configured (no `DOCK_API` set). Contact an admin.');
        }

        const container = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(
                '## Roblox Verification\n\n' +
                'To verify, you need to link your Discord to your Roblox account on **[Docksys](https://docksys.xyz/)**.\n\n' +
                '1. Go to [docksys.xyz](https://docksys.xyz/) and log in\n' +
                '2. Link your Discord account\n' +
                '3. Come back here and click **Verify**'
            ))
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('start-verify').setLabel('Verify').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setLabel('Go to Docksys').setURL('https://docksys.xyz/').setStyle(ButtonStyle.Link)
                ),
            );

        await message.channel.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
    },
};
