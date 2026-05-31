const {
    SlashCommandBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorSpacingSize,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
} = require('discord.js');
const Giveaway = require('../models/Giveaway');

function parseDuration(str) {
    const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    const match = str.match(/^(\d+)(s|m|h|d)$/);
    if (!match) throw new Error(`Invalid duration: "${str}". Use e.g. 10m, 2h, 1d`);
    return parseInt(match[1]) * units[match[2]];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Giveaway management.')
        .addSubcommand(sub => sub
            .setName('create')
            .setDescription('Create a new giveaway.')
            .addStringOption(o => o.setName('prize').setDescription('The prize.').setRequired(true))
            .addStringOption(o => o.setName('duration').setDescription('Duration (e.g. 1h, 30m, 2d).').setRequired(true))
            .addIntegerOption(o => o.setName('winners').setDescription('Number of winners.').setRequired(true))
        )
        .addSubcommand(sub => sub
            .setName('end')
            .setDescription('End a giveaway manually.')
            .addStringOption(o => o.setName('messageid').setDescription('Message ID of the giveaway.').setRequired(true))
        )
        .addSubcommand(sub => sub
            .setName('reroll')
            .setDescription('Reroll a giveaway.')
            .addStringOption(o => o.setName('messageid').setDescription('Message ID of the giveaway.').setRequired(true))
        ),

    async execute(interaction, client) {
        const hostRoleId = client.config.GIVEAWAY_HOST_ROLE_ID;
        if (hostRoleId && !interaction.member.roles.cache.has(hostRoleId)) {
            return interaction.reply({ content: '❌ You do not have permission to manage giveaways.', flags: MessageFlags.Ephemeral });
        }

        const sub = interaction.options.getSubcommand();

        if (sub === 'create') {
            const prize        = interaction.options.getString('prize');
            const durationStr  = interaction.options.getString('duration');
            const winnersCount = interaction.options.getInteger('winners');

            let durationMs;
            try {
                durationMs = parseDuration(durationStr);
            } catch (err) {
                return interaction.reply({ content: `❌ ${err.message}`, flags: MessageFlags.Ephemeral });
            }

            const endTime = new Date(Date.now() + durationMs);

            const container = new ContainerBuilder().setAccentColor(0x242429);

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `## **Prize:** ${prize}\n\n` +
                    `**Ends:** <t:${Math.floor(endTime.getTime() / 1000)}:R>\n` +
                    `**Winners:** **${winnersCount}**`
                )
            );
            container.addSeparatorComponents(s => s.setSpacing(SeparatorSpacingSize.Large));
            container.addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('giveaway:join').setStyle(ButtonStyle.Secondary).setLabel('Enter'),
                    new ButtonBuilder().setCustomId('giveaway:entries').setLabel('0').setStyle(ButtonStyle.Secondary)
                )
            );

            const msg = await interaction.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });

            await Giveaway.create({
                messageId: msg.id,
                channelId: interaction.channel.id,
                guildId: interaction.guild.id,
                prize,
                winnersCount,
                endTime,
                participants: [],
            });

            await interaction.reply({ content: `✅ Giveaway for **${prize}** created!`, flags: MessageFlags.Ephemeral });
        }

        if (sub === 'end') {
            const messageId = interaction.options.getString('messageid');
            const giveaway  = await Giveaway.findOne({ messageId });

            if (!giveaway) return interaction.reply({ content: '❌ Giveaway not found.', flags: MessageFlags.Ephemeral });
            if (giveaway.ended) return interaction.reply({ content: '❌ Giveaway already ended.', flags: MessageFlags.Ephemeral });

            const channel = await interaction.guild.channels.fetch(giveaway.channelId).catch(() => null);
            if (!channel) return interaction.reply({ content: '❌ Channel not found.', flags: MessageFlags.Ephemeral });

            const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
            if (!message) return interaction.reply({ content: '❌ Message not found.', flags: MessageFlags.Ephemeral });

            const now = new Date();
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
                    new ButtonBuilder().setCustomId('giveaway:join').setStyle(ButtonStyle.Secondary).setLabel('Enter').setDisabled(true),
                    new ButtonBuilder().setCustomId('giveaway:entries').setLabel(String(giveaway.participants.length)).setStyle(ButtonStyle.Secondary).setDisabled(true)
                )
            );
            await message.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });

            if (!giveaway.participants.length) {
                await message.reply('Giveaway ended with no participants.');
                giveaway.ended = true;
                await giveaway.save();
                return interaction.reply({ content: '✅ Giveaway ended (no participants).', flags: MessageFlags.Ephemeral });
            }

            const pool = [...giveaway.participants];
            const winners = [];
            for (let i = 0; i < giveaway.winnersCount && pool.length; i++) {
                winners.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
            }

            await message.reply(`🎉 Congratulations ${winners.map(id => `<@${id}>`).join(', ')} — you won **${giveaway.prize}**!`);
            giveaway.ended = true;
            await giveaway.save();

            await interaction.reply({ content: '✅ Giveaway ended.', flags: MessageFlags.Ephemeral });
        }

        if (sub === 'reroll') {
            const messageId = interaction.options.getString('messageid');
            const giveaway  = await Giveaway.findOne({ messageId });

            if (!giveaway) return interaction.reply({ content: '❌ Giveaway not found.', flags: MessageFlags.Ephemeral });
            if (!giveaway.ended) return interaction.reply({ content: '❌ Giveaway has not ended yet.', flags: MessageFlags.Ephemeral });
            if (!giveaway.participants.length) return interaction.reply({ content: '❌ No participants to reroll.', flags: MessageFlags.Ephemeral });

            const pool = [...giveaway.participants];
            const winners = [];
            for (let i = 0; i < giveaway.winnersCount && pool.length; i++) {
                winners.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
            }

            const channel = await interaction.guild.channels.fetch(giveaway.channelId).catch(() => null);
            if (channel) {
                const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
                if (message) await message.reply(`🎲 Rerolled winners: ${winners.map(id => `<@${id}>`).join(', ')}`);
            }

            await interaction.reply({ content: '✅ Giveaway rerolled.', flags: MessageFlags.Ephemeral });
        }
    },
};
