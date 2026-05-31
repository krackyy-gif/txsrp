const { Client } = require('discord.js');
const mongoose = require('mongoose');
const config = require('./config.json');

const client = new Client({
    intents: [
        'Guilds',
        'GuildMembers',
        'GuildMessages',
        'GuildPresences',
        'DirectMessages',
        'MessageContent',
    ],
});

client.config = config;
client.messages = new Map();
client.voteMap = new Map();
client.activePollId = null;
client.applicationData = new Map();
client.terminalLogs = [];

const _log = console.log;
const _err = console.error;

function stamp() {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

console.log = (...args) => {
    const line = args.join(' ');
    client.terminalLogs.push(line);
    if (client.terminalLogs.length > 1000) client.terminalLogs.shift();
    _log.apply(console, args);
};

console.error = (...args) => {
    const line = 'ERROR: ' + args.join(' ');
    client.terminalLogs.push(line);
    if (client.terminalLogs.length > 1000) client.terminalLogs.shift();
    _err.apply(console, args);
};

function logUsage(user, action) {
    const line = `${stamp()} | ${user.username}#${user.discriminator}(${user.id}) | ${action}`;
    client.terminalLogs.push(line);
    if (client.terminalLogs.length > 1000) client.terminalLogs.shift();
    _log(line);
}

require('./loaders/componentLoader')(client);
require('./loaders/eventLoader')(client);
require('./loaders/registerCommands')(client);

client.login(config.TOKEN);

client.once('ready', async () => {
    try {
        client.user.setActivity(null);

        if (config.MONGOURL) {
            mongoose.set('bufferCommands', false);
            await mongoose.connect(config.MONGOURL);
            console.log('Connected to MongoDB.');
            require('./utils/giveawayChecker')(client);
        }

        console.log(`Logged in as ${client.user.tag}`);
    } catch (err) {
        console.error('Ready event error:', err);
    }
});

client.on('messageCreate', async (message) => {
    const prefix = client.config.PREFIX || '$';
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const name = args.shift()?.toLowerCase();

    const cmd = client.messages.get(name)
        || [...client.messages.values()].find(c => c.aliases?.includes(name));

    if (!cmd) return;

    try {
        logUsage(message.author, `${prefix}${name}${args.length ? ' ' + args.join(' ') : ''}`);
        await cmd.execute(message, args, client);
    } catch (err) {
        console.error(err);
        message.reply('There was an error executing that command.').catch(() => {});
    }
});

async function handleInteraction(interaction, mapKey) {
    const name = interaction.customId ?? interaction.commandName;

    let handler = client[mapKey].get(name);
    if (!handler) {
        handler = [...client[mapKey].entries()]
            .find(([key]) => name.startsWith(key))?.[1];
    }
    if (!handler) return;

    try {
        if (interaction.isChatInputCommand()) {
            const opts = interaction.options?.data
                ?.map(o => ('value' in o ? o.value : o.options?.map(x => x.value).join(',') ?? ''))
                .filter(Boolean).join(' ');
            logUsage(interaction.user, `/${interaction.commandName}${opts ? ' ' + opts : ''}`);
        } else if (interaction.isButton()) {
            logUsage(interaction.user, `[${interaction.component?.label || 'Button'}](${interaction.customId})`);
        } else if (interaction.isStringSelectMenu()) {
            logUsage(interaction.user, `[Select](${interaction.customId}): ${interaction.values?.join(', ')}`);
        } else if (interaction.isModalSubmit()) {
            logUsage(interaction.user, `[Modal](${interaction.customId})`);
        }

        await handler.execute(interaction, client);
    } catch (err) {
        console.error(`Interaction error [${name}]:`, err);
        try {
            const payload = { content: String(err), embeds: [], components: [], files: [] };
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(payload).catch(() => {});
            } else {
                await interaction.reply({ ...payload, flags: 64 }).catch(() => {});
            }
        } catch {}
    }
}

client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand())       await handleInteraction(interaction, 'commands');
    else if (interaction.isButton())            await handleInteraction(interaction, 'buttons');
    else if (interaction.isStringSelectMenu())  await handleInteraction(interaction, 'dropdowns');
    else if (interaction.isModalSubmit())       await handleInteraction(interaction, 'modals');
    else if (interaction.isMessageContextMenuCommand() || interaction.isUserContextMenuCommand())
        await handleInteraction(interaction, 'context');
});
