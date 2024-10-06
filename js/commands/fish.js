import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { InteractionResponseType } from 'discord-interactions';
import { fishTypes } from '../game.js';
import FishCalculator from 'toonapi-calculator/js/fish.js';
import { LocalToonRequest } from '../utils.js';

export const data = new SlashCommandBuilder()
        .setName('fish')
        .setDescription('Get advising on catching new fish.')
        .setIntegrationTypes(1)
        .setContexts([0, 1, 2])
        .addStringOption(option =>
            option
                .setName('advising')
                .setDescription('What kind of advising do you want?')
                .setRequired(true)
                .addChoices(...fishTypes)
        );

export async function execute(req, res) {
    const LOCAL_TOON = await LocalToonRequest('fish.json');
    const { data } = req.body;
    const type = data.options && data.options.length > 0 ? data.options[0].value : null;
    const fishInfo = getFishInfo(JSON.stringify(LOCAL_TOON), type);

    const embed = new EmbedBuilder() {
        .setColor('')
    }
    return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: fishInfo,
        }
    });
}

function getFishInfo(toon, type) {
    const fishcalc = new FishCalculator(toon);
    console.log(toon);
    if (fishcalc.getNew().length == 0) {
        return `You have maxed fishing. Congratulations!`;
    }
    const footer = '\n-# The % rate reflects your chance of catching a new fish.'
    if (type === 'location') {
        let topFive = fishcalc.sortBestLocation().slice(0,5);
        const intro = `Here\'s your top ${fishcalc.length} locations!\n`;
        topFive = topFive.map((place, index) => `${index+1}. ${place[0]}:  **${Math.round(place[1] * 100)}%**`).join('\n');
        return `${intro}${topFive}${footer}`;
    } else if (type === 'rarity') {
        let topFive = fishcalc.sortBestRarity().slice(0,5);
        const intro = `Here\'s your top ${fishcalc.length} easiest new fish!\n`;
        topFive = topFive.map((fish, index) => `${index+1}. ${fish.name} in ${fish.location}: ~**${fish.buckets}** buckets (${Math.round(fish.probability*100)}%)`).join('\n');
        return `${intro}${topFive}${footer}`;
    }
}