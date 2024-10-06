import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
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
    const dna = LOCAL_TOON.toon.style;

    const embed = new EmbedBuilder()
        .setColor('Greyple')
        .setAuthor({ name: LOCAL_TOON.toon.name, iconURL: `https://rendition.toontownrewritten.com/render/${dna}/laffmeter/1024x1024.png` })
        .setThumbnail(`https://rendition.toontownrewritten.com/render/${dna}/waving/1024x1024.png`)
        .addFields(
            { name: 'Laff', value: simplifyLaff(LOCAL_TOON) },
            { name: 'Location', value: simplifyLocation(LOCAL_TOON) }
        )

    return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            embeds: [embed]
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