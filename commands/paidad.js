const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

const CHANNEL_ID = '';
const PERM_ROLES = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('paidad')
        .setDescription('Send a paid advertisement to the ads channel.')
        .addStringOption(o => o.setName('ad').setDescription('The advertisement message.').setRequired(true))
        .addStringOption(o => o.setName('invite').setDescription('Discord invite link for the server.').setRequired(true)),

    async execute(interaction) {
        const hasRole = PERM_ROLES.length === 0 || PERM_ROLES.some(id => interaction.member.roles.cache.has(id));
        if (!hasRole) {
            return interaction.reply({ content: '❌ You do not have permission.', flags: MessageFlags.Ephemeral });
        }

        const ad     = interaction.options.getString('ad');
        const invite = interaction.options.getString('invite');

        const channelId = CHANNEL_ID || interaction.client.config.OUTPUT_LOG_CHANNEL_ID;
        const channel = channelId
            ? interaction.guild.channels.cache.get(channelId) || await interaction.guild.channels.fetch(channelId).catch(() => null)
            : null;

        if (!channel) {
            return interaction.reply({ content: '❌ Paid ads channel not found. Set `CHANNEL_ID` in paidad.js.', flags: MessageFlags.Ephemeral });
        }

        await channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('📢  Paid Advertisement')
                    .setDescription(ad)
                    .setColor(0xFFC832)
                    .setFooter({ text: `Posted by ${interaction.user.tag}` })
                    .setTimestamp(),
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setLabel('Join Server').setStyle(ButtonStyle.Link).setURL(invite).setEmoji('🔗')
                ),
            ],
        });

        await interaction.reply({ content: `✅ Paid ad posted to ${channel}.`, flags: MessageFlags.Ephemeral });
    },
};
