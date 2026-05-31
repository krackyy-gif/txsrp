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

module.exports = function startGiveawayChecker(client) {
    setInterval(async () => {
        try {
            const now = new Date();
            const expired = await Giveaway.find({ ended: false, endTime: { $lte: now } });

            for (const giveaway of expired) {
                const guild = await client.guilds.fetch(giveaway.guildId).catch(() => null);
                if (!guild) continue;

                const channel = await guild.channels.fetch(giveaway.channelId).catch(() => null);
                if (!channel) continue;

                const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
                if (!message) continue;

                const container = new ContainerBuilder().setAccentColor(0x242429);

                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `## **Prize:** ${giveaway.prize}\n\n` +
                        `**Ended:** <t:${Math.floor(now.getTime() / 1000)}:R>\n` +
                        `**Winners:** **${giveaway.winnersCount}**`
                    )
                );

                container.addSeparatorComponents(s => s.setSpacing(SeparatorSpacingSize.Large));

                container.addActionRowComponents(
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('giveaway:join')
                            .setStyle(ButtonStyle.Secondary)
                            .setLabel('Enter')
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('giveaway:entries')
                            .setLabel(String(giveaway.participants.length))
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true)
                    )
                );

                await message.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });

                if (!giveaway.participants.length) {
                    await message.reply('Giveaway ended, but no one entered.');
                    giveaway.ended = true;
                    await giveaway.save();
                    continue;
                }

                const pool = [...giveaway.participants];
                const winners = [];
                for (let i = 0; i < giveaway.winnersCount && pool.length; i++) {
                    const idx = Math.floor(Math.random() * pool.length);
                    winners.push(pool.splice(idx, 1)[0]);
                }

                await message.reply(
                    `🎉 Congratulations ${winners.map(id => `<@${id}>`).join(', ')} — you won **${giveaway.prize}**!`
                );

                giveaway.ended = true;
                await giveaway.save();
            }
        } catch (err) {
            console.error('Giveaway checker error:', err);
        }
    }, 30_000);
};
