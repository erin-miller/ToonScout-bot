import 'dotenv/config';
import { verifyKey } from 'discord-interactions';
import { 
    gagTracks, 
    getSuitByValue, 
    numFacilities ,
} from './game.js';

const DEFAULT_PORT = 1547;
const MAX_PORT = 1552;
const HIGHEST_GAG = 7;
const INDENT = `        `;
let authToken = null;

export function VerifyDiscordRequest(clientKey) {
    return function (req, res, buf) {
      const signature = req.get('X-Signature-Ed25519');
      const timestamp = req.get('X-Signature-Timestamp');
      console.log(signature, timestamp, clientKey);
  
      const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
      if (!isValidRequest) {
        res.status(401).send('Bad request signature');
        throw new Error('Bad request signature');
      }
    };
  }

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

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function simplifyLaff(toon) {
    return `${toon.laff.current}/${toon.laff.max}`;
}

export function simplifyLocation(toon) {
    const loc = toon.location;
    let msg = `${loc.district}, ${loc.zone}`;
    if (loc.zone !== loc.neighborhood) {
        msg += `, ${loc.neighborhood}`
    }
    return msg;
}

export function getGagInfo(toon, userTrack) {
    const toonName = toon.toon.name;
    let gagInfo;
    if (userTrack) {
        gagInfo = toon.gags[userTrack];
        if (!gagInfo) {
            return `${toonName} does not have the ${userTrack} track.`;
        } else if (gagInfo.gag.level === HIGHEST_GAG) {
            return `${toonName} has **maxed** the ${userTrack} track.`;
        } else {
            return `${toonName} has **${gagInfo.experience.current}/${gagInfo.experience.next}** left to earn ${gagInfo.gag.name}, the next ${userTrack} gag.`;
        }
    } else { // no track selected, print overview of all tracks
        gagInfo = toon.gags;
        let allGags = ``;
        let hasOrg = false;
        let organic = `${INDENT}No organic track.\n${INDENT}`;

        // locate all tracks 
        for (let track of gagTracks) {
            if (gagInfo[track.value]) { // track exists, add info to allGags
                allGags += `${gagInfo[track.value].gag.name}, `;

                // find organic if there is one
                if (!hasOrg && gagInfo[track.value].organic) {
                    hasOrg = true;
                    organic = `${INDENT}Organic ${track.value}\n${INDENT}`;
                }
            }
        }

        // remove extra ', '
        allGags = allGags.slice(0, -2);
        return `**${toonName}**'s gags with ${toon.laff.max} laff:\n` + organic + allGags;
    }
}

export function getTaskInfo(toon, index) {
    // index is not 0-index based; it is in [1,2,...,tasks.length-1]
    const toonName = toon.toon.name;
    let deletable; 
    let taskInfo;
    index = index ? Number(index) : null;
    if (index) { // selected a specific task
        if (index > toon.tasks.length) {
            return `${toonName} has no task in slot ${index}.`
        }
        taskInfo = toon.tasks[index-1];
        deletable = taskInfo.deletable ? ` Just for Fun` : ``; 
        return `**${toonName}'s**${deletable} task ${index}:\n${INDENT}${getTaskTypeDetailed(taskInfo)}`
    } else {
        if (toon.tasks.length === 0) {
            return `**${toonName}** has no tasks.`
        }
        let allTasks = ``;
        for (let i = 0; i < toon.tasks.length; i++) {
            taskInfo = toon.tasks[i];
            deletable = taskInfo.deletable ? ` _Just for Fun_` : ``; 
            allTasks += `${INDENT}Task **${i+1}:** ${getTaskTypeSimple(taskInfo)}${deletable}\n`
        }
        return `**${toonName}** is working on:\n` + allTasks;
    }
}

export function getTaskTypeDetailed(taskInfo) {
    console.log(JSON.stringify(taskInfo));
    const progress = taskInfo.objective.progress.text;
    if (progress !== 'Complete' && progress !== '') { // not a visit task, don't display npc values
        return `**Objective:** ${taskInfo.objective.text}
        **Progress:** ${taskInfo.objective.progress.text}
        **Reward:** ${taskInfo.reward}`;
    } else { // display npc values for a visit task
        return `**Objective:** Visit ${taskInfo.to.name} in ${taskInfo.to.building}
        **Location:** ${taskInfo.to.zone}, ${taskInfo.to.neighborhood}
        **Reward:** ${taskInfo.reward}`;
    }
}

export function getTaskTypeSimple(taskInfo) {
    const progress = taskInfo.objective.progress.text;
    if (progress !== 'Complete' && progress !== '') { // not a visit task, don't display npc values
        return `${taskInfo.objective.text} (${taskInfo.objective.progress.text})`;
    } else { // display npc values for a visit task
        return `Visit ${taskInfo.to.building} on ${taskInfo.to.zone}, ${taskInfo.to.neighborhood}`;
    }
}

export function getSuitInfo(toon, type) {
    const promo = toon[type].promotion.target - toon[type].promotion.current

    if (!toon[type].hasDisguise) {
        return `You don't have your ${getSuitByValue(type)} suit!`;
    }
    return numFacilities(promo, type);
}

function initAuthToken() {
    if (!authToken) {
        authToken = Math.random().toString(36).substring(2);
        console.log("New session token generated.");
    }
}