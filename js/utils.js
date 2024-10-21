import 'dotenv/config';
import { getToken } from './db/token.js';
import { InteractionResponseType } from 'discord-interactions';

export async function DiscordRequest(endpoint, options) {
    // append endpoint to root API URL
    const url = 'https://discord.com/api/v10/' + endpoint;
    // Stringify payloads
    if (options.body) options.body = JSON.stringify(options.body);
    const res = await fetch(url, {
        headers: {
        Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'User-Agent':
            'ToonScout (https://github.com/erin-miller/toonScout, 1.0.0)',
        },
        ...options,
    });
    // throw API errors
    if (!res.ok) {
        const data = await res.json();
        console.log(res.status);
        throw new Error(JSON.stringify(data));
    }
    // return original response
    return res;
}

export async function InstallGlobalCommands(appId, commands) {
    // API endpoint to overwrite global commands
    const endpoint = `applications/${appId}/commands`;

    try {
        // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
        await DiscordRequest(endpoint, { method: 'PUT', body: commands });
    } catch (err) {
        console.error(err);
    }
}

export function getUser(req) {
    const { user: direct, member } = req.body;
    return direct ? direct.username : member.user.username;
}

export function getGlobalUser(req) {
    const { user: direct, member } = req.body;
    return direct ? direct.global_name : member.user.username;
}

export function getUserId(req) {
    const { user: direct, member } = req.body;
    return direct ? direct.id : member.user.id;
}

export function getToonRendition(local_toon, pose) {
    const dna = local_toon.toon.style;
    return `https://rendition.toontownrewritten.com/render/${dna}/${pose}/1024x1024.png`
}

export async function validateUser(targetUser, res) {
    if (targetUser) {
        const targetToon = await getToken(targetUser);

        if (!targetToon) {
            await res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `That user has not connected to ToonScout.`,
                    flags: 64
                }
            });
            return null;
        }

        return targetToon;
    }

    return null;
}

function formatDate(date) {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Pad minutes with leading zero if necessary
    const formattedMinutes = minutes.toString().padStart(2, '0');

    // Create the final formatted string
    return `${month} ${day}, ${year} ${hours}:${formattedMinutes}`;
}

export function getModified(date) {
    const timestamp = Math.floor(date.getTime() / 1000);
    return `Updated <t:${timestamp}:R>`;
}
