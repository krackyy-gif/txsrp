const {
    ContainerBuilder,
    TextDisplayBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
} = require('discord.js');
const { getRobloxInfo } = require('../utils/docksystem');

const ADD_ROLE_ID    = '';
const REMOVE_ROLE_ID = '';
const LOG_CHANNEL_ID = '';

module.exports = {
    customID: 'continue-verify',

    async execute(interaction, client) {
        if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();

        const { robloxId, username, error } = await getRobloxInfo(interaction.user.id, interaction, client);

        if (error) return interaction.editReply({ content: `❌ ${error}`, components: [] });

        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (ADD_ROLE_ID)    await member.roles.add(ADD_ROLE_ID).catch(() => {});
        if (REMOVE_ROLE_ID) await member.roles.remove(REMOVE_ROLE_ID).catch(() => {});

        const profileLink = `https://www.roblox.com/users/${robloxId}/profile`;

        await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: [
                new ContainerBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent('### ✅ Verification Successful'))
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Verified as **[${username}](${profileLink})**`)),
            ],
        });

        if (LOG_CHANNEL_ID) {
            const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('Account Verification')
                    .setDescription(`**${interaction.user.username}** has successfully linked their Roblox account.`)
                    .addFields(
                        { name: 'Joined',           value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                        { name: 'Verified At',      value: `<t:${Math.floor(Date.now() / 1000)}:R>`,            inline: true },
                        { name: 'Roblox Username',  value: `\`${username}\``,                                   inline: true },
                        { name: 'Roblox ID',        value: `\`${robloxId}\``,                                   inline: true },
                        { name: 'Discord',          value: `<@${interaction.user.id}>`,                         inline: true },
                    )
                    .setColor(0x2b2d31)
                    .setTimestamp();

                await logChannel.send({
                    embeds: [logEmbed],
                    components: [new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setLabel('View Profile').setURL(profileLink).setStyle(ButtonStyle.Link)
                    )],
                });
            }
        }
    },
};
