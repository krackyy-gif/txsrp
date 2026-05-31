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

const PER_PAGE = 20;

function buildPage(giveaway, page) {
    const participants = giveaway.participants.map(id => `<@${id}>`);
    const maxPage = Math.ceil(participants.length / PER_PAGE) - 1;
    const chunk   = participants.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

    const container = new ContainerBuilder().setAccentColor(0x242429);
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(chunk.join('\n')));
    container.addSeparatorComponents(s => s.setSpacing(SeparatorSpacingSize.Large));
    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`giveaway:entries_prev:${page}`).setLabel('Back').setStyle(ButtonStyle.Secondary).setDisabled(page === 0),
            new ButtonBuilder().setCustomId(`giveaway:entries_next:${page}`).setLabel('Next').setStyle(ButtonStyle.Secondary).setDisabled(page >= maxPage),
        )
    );

    return container;
}

module.exports = {
    customID: 'giveaway:entries',

    async execute(interaction) {
        const giveaway = await Giveaway.findOne({ messageId: interaction.message.id });
        if (!giveaway) return interaction.reply({ content: '❌ Giveaway not found.', flags: MessageFlags.Ephemeral });

        if (!giveaway.participants.length) {
            return interaction.reply({
                components: [
                    new ContainerBuilder().setAccentColor(0x242429)
                        .addTextDisplayComponents(new TextDisplayBuilder().setContent('There are currently **no entries** for this giveaway.'))
                ],
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        return interaction.reply({
            components: [buildPage(giveaway, 0)],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
    },

    buildPage,
};
