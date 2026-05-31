const path = require('node:path');
const fs = require('node:fs');
const { SlashCommandBuilder } = require('discord.js');
const readFolder = require('./readFolder');

const MODULES = ['commands', 'buttons', 'dropdowns', 'modals', 'messages', 'context'];

module.exports = function loadComponents(client) {
    for (const mod of MODULES) {
        client[mod] = new Map();

        const dir = path.join(__dirname, '..', mod);
        if (!fs.existsSync(dir)) continue;

        const files = readFolder(dir);

        for (const { path: filePath, data } of files) {
            try {
                if (typeof data.execute !== 'function') {
                    throw new Error('Missing execute function');
                }

                if (mod === 'commands' || mod === 'context') {
                    if (!(data.data instanceof SlashCommandBuilder)) {
                        throw new Error('Must use SlashCommandBuilder');
                    }
                    client[mod].set(data.data.name, data);

                } else if (mod === 'messages') {
                    if (typeof data.name !== 'string') {
                        throw new Error('Missing name property');
                    }
                    client[mod].set(data.name.toLowerCase(), data);

                } else {
                    if (typeof data.customID !== 'string') {
                        throw new Error('Missing customID string');
                    }
                    client[mod].set(data.customID, data);
                }
            } catch (err) {
                console.error(`[${mod.toUpperCase()}] Failed to load ${filePath}: ${err.message}`);
            }
        }

        if (client[mod].size > 0) {
            console.log(`Loaded ${client[mod].size} ${mod}`);
        }
    }
};
