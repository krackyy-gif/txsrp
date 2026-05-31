const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorSpacingSize,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
} = require('discord.js');
const Giveaway = require('../models/Giveaway');

module.exports = {
    customID: 'giveaway:join',

    async execute(interaction) {
        const giveaway = await Giveaway.findOne({ messageId: interaction.message.id });
        if (!giveaway) return interaction.reply({ content: '❌ Giveaway not found.', flags: MessageFlags.Ephemeral });
        if (giveaway.ended) return interaction.reply({ content: '❌ This giveaway has already ended.', flags: MessageFlags.Ephemeral });

        const userId   = interaction.user.id;
        const hasJoined = giveaway.participants.includes(userId);

        if (hasJoined) {
            giveaway.participants = giveaway.participants.filter(id => id !== userId);
        } else {
            giveaway.participants.push(userId);
        }
        await giveaway.save();

        await interaction.reply({
            content: hasJoined ? '✅ You left the giveaway.' : '🎉 You entered the giveaway!',
            flags: MessageFlags.Ephemeral,
        });

        const container = new ContainerBuilder().setAccentColor(0x242429);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## **Prize:** ${giveaway.prize}\n\n` +
                `**Ends:** <t:${Math.floor(giveaway.endTime.getTime() / 1000)}:R>\n` +
                `**Winners:** **${giveaway.winnersCount}**`
            )
        );
        container.addSeparatorComponents(s => s.setSpacing(SeparatorSpacingSize.Large));
        container.addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('giveaway:join').setStyle(ButtonStyle.Secondary).setLabel('Enter'),
                new ButtonBuilder().setCustomId('giveaway:entries').setLabel(String(giveaway.participants.length)).setStyle(ButtonStyle.Secondary)
            )
        );

        await interaction.message.edit({ components: [container], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
    },
};
