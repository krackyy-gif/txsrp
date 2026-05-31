const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
} = require('discord.js');
const { getRobloxInfo } = require('../utils/docksystem');

module.exports = {
    customID: 'start-verify',

    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const data = await getRobloxInfo(interaction.user.id, interaction, client);

        if (!data || data.error) {
            return interaction.editReply(`❌ ${data?.error || "Couldn't verify your Roblox account. Make sure your Discord is linked in Docksys."}`);
        }

        const { robloxId, username } = data;
        const profileLink = `https://www.roblox.com/users/${robloxId}/profile`;

        await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: [
                new ContainerBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent('## Roblox Verification'))
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            `You already have **[${username}](${profileLink})** linked.\n\n` +
                            `To switch accounts, click **Change Account**.\n` +
                            `To continue with this account, click **Continue**.`
                        )
                    )
                    .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
                    .addActionRowComponents(
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setLabel('Change Account').setStyle(ButtonStyle.Link).setURL('https://docksys.xyz/account'),
                            new ButtonBuilder().setCustomId('continue-verify').setLabel('Continue').setStyle(ButtonStyle.Success)
                        )
                    ),
            ],
        });
    },
};
