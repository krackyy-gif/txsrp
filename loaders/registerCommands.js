const { REST, Routes } = require('discord.js');

module.exports = function registerCommands(client) {
    const commands = [];
    const seen = new Set();

    for (const [, cmd] of client.commands) {
        const json = cmd.data?.toJSON?.();
        if (!json || seen.has(json.name)) continue;
        seen.add(json.name);
        json.dm_permission ??= false;
        commands.push(json);
    }

    const rest = new REST({ version: '10' }).setToken(client.config.TOKEN);

    (async () => {
        try {
            if (client.config.GUILD_ID) {
                await rest.put(Routes.applicationCommands(client.config.APP_ID), { body: [] });
                await rest.put(
                    Routes.applicationGuildCommands(client.config.APP_ID, client.config.GUILD_ID),
                    { body: commands }
                );
                console.log(`Registered ${commands.length} commands to guild ${client.config.GUILD_ID}`);
            } else {
                await rest.put(Routes.applicationCommands(client.config.APP_ID), { body: commands });
                console.log(`Registered ${commands.length} commands globally`);
            }
        } catch (err) {
            console.error('Failed to register commands:', err);
        }
    })();
};
