const {
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    MessageFlags,
} = require('discord.js');
const Ticket     = require('../models/Ticket');
const TICKET_TYPES = require('../utils/ticketTypes');
const { getRobloxInfo } = require('../utils/docksystem');
const crypto = require('crypto');

module.exports = {
    customID: 'ticketModal',

    async execute(interaction, client) {
        const typeKey    = interaction.customId.split('_')[1];
        const ticketType = TICKET_TYPES[typeKey];

        if (!ticketType) {
            return interaction.reply({ content: '❌ Unknown ticket type.', flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const inquiry = interaction.fields.getTextInputValue('inquiry');
        const { guild, user }   = interaction;

        const roblox = await getRobloxInfo(user.id, interaction, client).catch(() => null);
        const robloxText = roblox && !roblox.error
            ? `[${roblox.username}](https://www.roblox.com/users/${roblox.robloxId}/profile)`
            : 'Not linked';

        let channel;
        try {
            channel = await guild.channels.create({
                name: `${user.username}-ticket`,
                type: ChannelType.GuildText,
                parent: ticketType.categoryId || null,
                permissionOverwrites: [
                    { id: guild.roles.everyone.id,          deny:  [PermissionFlagsBits.ViewChannel] },
                    { id: user.id,                          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                    { id: client.user.id,                   allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] },
                    ...(ticketType.pingRoleId ? [{ id: ticketType.pingRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }] : []),
                ],
            });
        } catch (err) {
            console.error('Failed to create ticket channel:', err);
            return interaction.editReply('❌ Failed to create ticket channel. Please contact a staff member.');
        }

        const ticketId = crypto.randomBytes(4).toString('hex').toUpperCase();

        const embed = new EmbedBuilder()
            .setTitle(`${ticketType.label} Ticket`)
            .setColor(0x242429)
            .addFields(
                { name: '👤  Member',       value: `${user}`,      inline: true },
                { name: '🎮  Roblox',       value: robloxText,     inline: true },
                { name: '🎫  Ticket ID',    value: `\`${ticketId}\``, inline: true },
                { name: '📋  Inquiry',      value: inquiry,        inline: false },
            )
            .setFooter({ text: `Ticket ID: ${ticketId}` })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claimTicket').setLabel('Claim').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('closeTicket').setLabel('Close').setStyle(ButtonStyle.Danger),
        );

        const ping = ticketType.pingRoleId ? `<@&${ticketType.pingRoleId}>` : '';
        const msg  = await channel.send({ content: `${user} ${ping}`.trim(), embeds: [embed], components: [row] });

        await Ticket.create({
            userId:    user.id,
            username:  user.username,
            channelId: channel.id,
            messageId: msg.id,
            ticketId,
            type:      ticketType.label,
        }).catch(console.error);

        await interaction.editReply(`✅ Your ticket has been created: ${channel}`);
    },
};
