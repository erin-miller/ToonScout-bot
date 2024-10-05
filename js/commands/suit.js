import { SlashCommandBuilder } from 'discord.js';
import { InteractionResponseType } from 'discord-interactions';
import { suitTypes } from '../game.js';
import { LocalToonRequest } from '../utils.js';
import SuitCalculator from 'toonapi-calculator/js/suits.js';

export const data = new SlashCommandBuilder()
        .setName('suit')
        .setDescription('Find information about your cog suits.')
        .setIntegrationTypes(1)
        .setContexts([0, 1, 2])
        .addStringOption(option =>
            option
                .setName('cog_type')
                .setDescription('The cog type you want to see.')
                .setRequired(true)
                .addChoices(...suitTypes)
        );

export async function execute(req, res) {
    const LOCAL_TOON = await LocalToonRequest('cogsuits.json');
    const { data } = req.body;
    const cogsuit = data.options && data.options.length > 0 ? data.options[0].value : null;
    return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: getSuitInfo(JSON.stringify(LOCAL_TOON), cogsuit),
        }
    });
}

function getSuitInfo(toon, type) {
    const suitcalc = new SuitCalculator(toon);
    return JSON.stringify(suitcalc.getBestPathWeighted(type));
}