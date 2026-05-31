const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } = require('discord.js');

const LABELS = {
    APPLICATION_CHANNEL_ID:   'Application Channel ID',
    APP_RESULT_CHANNEL_ID:    'App Result Channel ID',
    PROMOTION_CHANNEL_ID:     'Promotion Log Channel ID',
    INFRACTION_CHANNEL_ID:    'Infraction Log Channel ID',
    OUTPUT_LOG_CHANNEL_ID:    'Output Log Channel ID',
    TRANSCRIPT_CHANNEL_ID:    'Ticket Transcript Channel ID',
    PROMOTION_PERM_ROLE_ID:   'Promotion Perm Role ID(s) (comma-separated)',
    INFRACTION_PERM_ROLE_ID:  'Infraction Perm Role ID(s) (comma-separated)',
    SAY_REQUIRED_ROLE_ID:     'Say Required Role ID',
    TICKET_CLAIM_ROLE_ID:     'Ticket Claim Role ID',
    TICKET_CLOSE_ROLE_ID:     'Ticket Close Role ID',
    SESSION_CHANNEL_ID:       'Session Channel ID',
    SESSION_ROLE_ID:          'Session Ping Role ID',
    NOTIFICATION_ROLE_ID:     'Notification Role ID',
    GIVEAWAY_HOST_ROLE_ID:    'Giveaway Host Role ID',
    PREFIX:                   'Command Prefix',
    ERLC_SERVER_KEY:          'ER:LC Server Key',
    DOCK_API:                 'Docksys API Key',
    MONGOURL:                 'MongoDB Connection URL',
    GUILD_ID:                 'Guild ID',
    WARNING_1_ROLE_ID:        'Warning 1 Role ID',
    WARNING_2_ROLE_ID:        'Warning 2 Role ID',
    STRIKE_1_ROLE_ID:         'Strike 1 Role ID',
    STRIKE_2_ROLE_ID:         'Strike 2 Role ID',
    SUPERUSER_ADD:            'Add Superuser (Discord User ID)',
    SUPERUSER_REMOVE:         'Remove Superuser (Discord User ID)',
};

module.exports = {
    customID: 'config:select',

    async execute(interaction) {
        const key   = interaction.values[0];
        const label = LABELS[key] || key;
        const cfg   = interaction.client.config;

        let currentValue = '';
        if (key === 'SUPERUSER_ADD' || key === 'SUPERUSER_REMOVE') {
            currentValue = (cfg.SUPERUSER_IDS || []).join(', ');
        } else {
            const v = cfg[key];
            currentValue = Array.isArray(v) ? v.join(', ') : (v || '');
        }

        const modal = new ModalBuilder()
            .setCustomId(`config:modal_${key}`)
            .setTitle('Update Configuration');

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('value')
                    .setLabel(label.slice(0, 45))
                    .setStyle(TextInputStyle.Short)
                    .setValue(currentValue.slice(0, 100))
                    .setRequired(false)
                    .setPlaceholder('Enter new value, or leave blank to clear'),
            ),
        );

        await interaction.showModal(modal);
    },
};
