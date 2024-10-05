import { SlashCommandBuilder } from 'discord.js';
import { InteractionResponseType } from 'discord-interactions';
import { gagTracks } from '../game.js';
import { LocalToonRequest } from '../utils.js';
const INDENT = `        `;
const HIGHEST_GAG = 7;

export const data = new SlashCommandBuilder()
        .setName('gags')
        .setDescription('Show an overview of one or all your gags.')
        .setIntegrationTypes(1)
        .setContexts([0, 1, 2])
        .addStringOption(option =>
            option
                .setName('track')
                .setDescription('The gag track you want to show.')
                .setRequired(false)
                .addChoices(...gagTracks)
        );

export async function execute(req, res) {
    const LOCAL_TOON = await LocalToonRequest('info.json');
    const { data } = req.body;
    // default to null if no option provided
    const track = data.options && data.options.length > 0 ? data.options[0].value : null;
    return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: getGagInfo(LOCAL_TOON, track),
        }
    });
}

function getGagInfo(toon, userTrack) {
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