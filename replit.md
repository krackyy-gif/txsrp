# Discord Bot

A full-featured Discord management bot for a Roblox RP community.

## Features
- **Ticket System** — multi-type tickets with claim/close, transcript logging
- **Staff Management** — promotions, infractions, profiles, revocations
- **Session System** — vote, startup, shutdown, boost, full embeds
- **Giveaway System** — create, auto-end, reroll with live participant counts
- **Roblox Verification** — via Docksys API linking
- **ER:LC Integration** — server info, player info, player count, execute commands
- **Application System** — 15-question 3-part staff applications with accept/deny
- **Config System** — fully editable via `/config` command + modals
- **Diagnostics** — `/fix` command checks all channels, roles, permissions, DB

## Setup
1. Fill in `config.json` with your token, app ID, guild ID, and MongoDB URL at minimum
2. Run `npm start`
3. Use `/config` in Discord to configure channels, roles, and API keys

## User Preferences
- Clean, single-file-per-component structure
- No comments unless explicitly requested
- All IDs and secrets stored in config.json, editable via /config modal
- `customID` (capital D) used consistently for all buttons/dropdowns/modals
