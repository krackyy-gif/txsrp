const fs = require('node:fs');
const path = require('node:path');

module.exports = function readFolder(folderPath, depth = 3) {
    const results = [];

    function scan(dir, remaining) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                if (remaining > 0) scan(fullPath, remaining - 1);
                continue;
            }

            if (!entry.name.endsWith('.js')) continue;

            try {
                const data = require(fullPath) || {};
                results.push({ path: fullPath, data });
            } catch (err) {
                console.error(`Failed to load ${fullPath}: ${err.message}`);
            }
        }
    }

    scan(folderPath, depth);
    return results;
};
