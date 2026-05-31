const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const ROASTS = [
    '{user} is so forgettable, their own shadow forgets to follow them.',
    '{user} is proof that even WiFi has dead zones — and they\'re one of them.',
    '{user} has the energy of a wet paper bag and twice the floppiness.',
    '{user} could start an argument in an empty room and still lose it.',
    '{user}\'s ideas are like their hairline — always receding.',
    '{user} is like a software update: nobody asked for them and they always show up at the worst time.',
    'If {user} were any more underwhelming, they\'d be a loading screen.',
    '{user} is the human equivalent of a participation trophy.',
    '{user} has the personality of unseasoned plain rice — and not even warm rice.',
    '{user} is so slow they get lapped by parked cars.',
    '{user} is like a pop-up ad — unwanted, annoying, and impossible to take seriously.',
    '{user}\'s jokes are like their future: short, dark, and nobody\'s laughing.',
    '{user} brings so little to the table, they showed up without a chair.',
    '{user} is the reason instructions have to say "step 1."',
    '{user} could trip over a wireless connection.',
    'If common sense were a sport, {user} would be the waterboy — and still get benched.',
    '{user} is like a speed bump: in the way, not doing much, and easily ignored.',
    '{user} has the attention span of a goldfish, but goldfish are cuter.',
    '{user} is so basic they make plain toast look exciting.',
    '{user} has exactly two modes: offline and useless.',
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roast')
        .setDescription('Roast a user — no mercy.')
        .addUserOption(o =>
            o.setName('user').setDescription('The user to roast.').setRequired(true)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const roast  = ROASTS[Math.floor(Math.random() * ROASTS.length)].replace(/{user}/g, `${target}`);

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`🔥 ${roast}`)
                    .setColor(0xFF4500)
                    .setFooter({ text: `Requested by ${interaction.user.tag}` })
                    .setTimestamp(),
            ],
        });
    },
};
