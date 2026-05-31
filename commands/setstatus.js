const { SlashCommandBuilder, ActivityType, MessageFlags } = require('discord.js');
const { COLORS, hasPerm, sendOutputLog } = require('../utils/staffHelpers');

const TYPE_MAP = {
    watching:  ActivityType.Watching,
    listening: ActivityType.Listening,
    playing:   ActivityType.Playing,
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setstatus')
        .setDescription("Change the bot's activity status.")
        .addStringOption(o =>
            o.setName('status').setDescription('The status text.').setRequired(true)
        )
        .addStringOption(o =>
            o.setName('type').setDescription('Activity type.').setRequired(false)
             .addChoices(
                 { name: 'Watching',  value: 'watching'  },
                 { name: 'Listening', value: 'listening' },
                 { name: 'Playing',   value: 'playing'   },
             )
        ),

    async execute(interaction) {
        if (!hasPerm(interaction)) {
            return interaction.reply({ content: '❌ You do not have permission.', flags: MessageFlags.Ephemeral });
        }

        const text = interaction.options.getString('status');
        const type = interaction.options.getString('type') || 'watching';

        await interaction.client.user.setActivity({ name: text, type: TYPE_MAP[type] });

        await sendOutputLog(interaction.client, {
            action: 'Status Changed',
            moderator: interaction.user.tag,
            detail: `${type} ${text}`,
            color: COLORS.INFO,
        });

        await interaction.reply({
            content: `✅ Status set to **${type.charAt(0).toUpperCase() + type.slice(1)} ${text}**`,
            flags: MessageFlags.Ephemeral,
        });
    },
};
