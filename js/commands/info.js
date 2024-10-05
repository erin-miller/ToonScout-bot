import { SlashCommandBuilder } from 'discord.js';
import { InteractionResponseType } from 'discord-interactions';
import { LocalToonRequest, getGlobalUser } from '../utils.js';

export const data = new SlashCommandBuilder()
        .setName('info')
        .setDescription('Show your toon\'s name, laff, and location.')
        .setIntegrationTypes(1)
        .setContexts([0, 1, 2]);

export async function execute(req, res) {
    const LOCAL_TOON = await LocalToonRequest('info.json');
    const globalUser = getGlobalUser(req);

    return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { 
            content: `${globalUser}'s toon, **${LOCAL_TOON.toon.name}**, has ${simplifyLaff(LOCAL_TOON)} laff and is located in ${simplifyLocation(LOCAL_TOON)}.`,
        }
    });
}

function simplifyLaff(toon) {
    return `${toon.laff.current}/${toon.laff.max}`;
}

function simplifyLocation(toon) {
    const loc = toon.location;
    let msg = `${loc.district}, ${loc.zone}`;
    if (loc.zone !== loc.neighborhood) {
        msg += `, ${loc.neighborhood}`
    }
    return msg;
}