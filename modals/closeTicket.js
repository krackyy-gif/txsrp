const { EmbedBuilder, MessageFlags } = require('discord.js');
const Ticket = require('../models/Ticket');

module.exports = {
    customID: 'closeTicketModal',

    async execute(interaction) {
        const roleId = interaction.client.config.TICKET_CLOSE_ROLE_ID;
        if (roleId && !interaction.member.roles.cache.has(roleId)) {
            return interaction.reply({ content: '❌ You do not have permission to close tickets.', flags: MessageFlags.Ephemeral });
        }

        const channel     = interaction.channel;
        const closer      = interaction.user;
        const closeReason = interaction.fields.getTextInputValue('closeReason')?.trim() || 'No reason provided.';

        await interaction.reply({ content: '🔒 Closing this ticket...' });

        let ticket = null;
        try {
            ticket = await Ticket.findOneAndUpdate(
                { channelId: channel.id },
                { status: 'closed', closedBy: closer.id, closeReason },
                { new: false }
            );
        } catch (err) {
            console.error('DB error while closing ticket:', err);
        }

        const transcriptChannelId = interaction.client.config.TRANSCRIPT_CHANNEL_ID;
        if (transcriptChannelId && ticket) {
            try {
                const DiscordTranscripts = require('discord-html-transcripts');
                const transcript = await DiscordTranscripts.createTranscript(channel, {
                    limit: -1,
                    filename: `ticket-${ticket.ticketId || channel.id}.html`,
                    saveImages: false,
                });

                const logEmbed = new EmbedBuilder()
                    .setTitle('Ticket Closed')
                    .setColor(0x242429)
                    .addFields(
                        { name: 'Closed By',  value: `<@${closer.id}>`,        inline: true },
                        { name: 'Reason',     value: closeReason,               inline: true },
                    )
                    .setFooter({ text: `Ticket ID: ${ticket.ticketId || channel.id}` })
                    .setTimestamp();

                const logChannel = await interaction.client.channels.fetch(transcriptChannelId).catch(() => null);
                if (logChannel) await logChannel.send({ embeds: [logEmbed], files: [transcript] });
            } catch (err) {
                console.error('Transcript error:', err);
            }
        }

        if (ticket?.userId) {
            const user = await interaction.client.users.fetch(ticket.userId).catch(() => null);
            if (user) {
                await user.send({
                    embeds: [new EmbedBuilder()
                        .setTitle('Your Ticket Has Been Closed')
                        .setColor(0x242429)
                        .addFields(
                            { name: 'Closed By', value: `<@${closer.id}>`, inline: true },
                            { name: 'Reason',    value: closeReason,        inline: true },
                        )
                        .setFooter({ text: `Ticket ID: ${ticket.ticketId || channel.id}` })
                        .setTimestamp()],
                }).catch(() => {});
            }
        }

        setTimeout(() => channel.delete().catch(() => {}), 3000);
    },
};
