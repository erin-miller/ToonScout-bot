import 'dotenv/config';

const DEFAULT_PORT = 1547;
const MAX_PORT = 1552;
let authToken = null;

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

export async function LocalToonRequest(request) {
    let port = DEFAULT_PORT;
    initAuthToken();
    const endpoint = request;

    const url = `http://localhost:${port}/${endpoint}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Host: `localhost:${port}`,
                'User-Agent': 'ToonScout',
                Authorization: authToken,
                'Connection': 'close',
            },
        });

        if (response.ok) {
            // parse as JSON
            return await response.json();
        } else {
            const body = await response.text();
            console.log(`Error on port ${port}: ${response.status} ${response.statusText}`, body);
        }
    } catch (error) {
        console.log(`Error making request on port ${port}:`, error);
    }

    throw new Error('Failed to connect to API server on any port');
}

export function getUser(req) {
    const { user: direct, member } = req.body;
    return direct ? direct.username : member.user.username;
}

export function getGlobalUser(req) {
    const { user: direct, member } = req.body;
    return direct ? direct.global_name : member.user.username;
}

export function getToonRendition(local_toon, pose) {
    const dna = local_toon.toon.style;
    return `https://rendition.toontownrewritten.com/render/${dna}/${pose}/1024x1024.png`
}

function initAuthToken() {
    if (!authToken) {
        authToken = Math.random().toString(36).substring(2);
        console.log("New session token generated.");
    }
}