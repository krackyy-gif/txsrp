const path = require('node:path');
const fs = require('node:fs');
const { Events } = require('discord.js');
const readFolder = require('./readFolder');

module.exports = function loadEvents(client) {
    const dir = path.join(__dirname, '..', 'events');
    if (!fs.existsSync(dir)) return;

    const files = readFolder(dir);

    for (const { path: filePath, data } of files) {
        if (typeof data.name !== 'string') {
            console.error(`Event missing name: ${filePath}`);
            continue;
        }
        if (typeof data.execute !== 'function') {
            console.error(`Event missing execute: ${filePath}`);
            continue;
        }

        const eventName = Events[data.name] ?? data.name;
        client[data.once ? 'once' : 'on'](eventName, (...args) => data.execute(client, ...args));
    }

    console.log(`Loaded ${files.length} events`);
};
