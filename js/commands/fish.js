import { 
    SlashCommandBuilder, 
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder 
} from 'discord.js';
import { InteractionResponseType } from 'discord-interactions';
import FishCalculator from 'toonapi-calculator/js/fish.js';
import { LocalToonRequest, getToonRendition } from '../utils.js';

const fisherman = 'https://static.toontownrewritten.wiki/uploads/e/eb/Crocodile_fishing.png';
const bucket = 'https://i.imgur.com/jpy0keb.png';
const teleport = 'https://i.imgur.com/DtJjCcH.png';
const fish = [
    'https://i.imgur.com/4XkjqzJ.png',
    'https://i.imgur.com/EiedLlg.png',
    'https://i.imgur.com/NHPl4Y9.png',
    'https://i.imgur.com/RnmDLY2.png',
    'https://i.imgur.com/a56BVTE.png',
    'https://i.imgur.com/k5Xc46Z.png',
    'https://i.imgur.com/UusWLZn.png',
    'https://i.imgur.com/QkVyni1.png',
    'https://i.imgur.com/JeaexHO.png',
    'https://i.imgur.com/ATQp9jz.png',
    'https://i.imgur.com/4Pz49Hc.png',
    'https://i.imgur.com/P93jQf5.png',
    'https://i.imgur.com/AHefykm.png',
    'https://i.imgur.com/cMBgGLz.png',
    'https://i.imgur.com/ETCwwNU.png',
]

export const data = new SlashCommandBuilder()
        .setName('fish')
        .setDescription('Get advising on catching new fish.')
        .setIntegrationTypes(1)
        .setContexts([0, 1, 2])

export async function execute(req, res) {
    const LOCAL_TOON = await LocalToonRequest('all.json');
    
    const row = new ActionRowBuilder()
        .addComponents(
            getWhatButton(),
            getWhereButton()
        )
    
    return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            embeds: [getHomeEmbed(LOCAL_TOON)],
            components: [row]
        }
    });
}

export async function handleButton(customId) {
    const LOCAL_TOON = await LocalToonRequest('all.json');
    let embed;
    let row;

    const [, actionWithState] = customId.split('-');
    const [action, state] = actionWithState.split(':');

    if (action === 'refresh') {
        switch (state) {
            case 'where':
                embed = getWhereEmbed(LOCAL_TOON);
                row = getWhereRow();
                break;
            case 'what':
                embed = getWhatEmbed(LOCAL_TOON);
                row = getWhatRow();
                break;
            default:
                return;
        }
    } else {
        switch (customId) {
            case 'fish-home':
                embed = getHomeEmbed(LOCAL_TOON);
                row = getHomeRow();
                break;
            case 'fish-where':
                embed = getWhereEmbed(LOCAL_TOON);
                row = getWhereRow();
                break;
            case 'fish-what':
                embed = getWhatEmbed(LOCAL_TOON);
                row = getWhatRow();
                break;
            default:
                return;
        }
    }

    return { embed, row };
}

function getHomeEmbed(LOCAL_TOON) {
    return new EmbedBuilder()
        .setColor('Blue')
        .setAuthor({ name: LOCAL_TOON.toon.name, iconURL: getToonRendition(LOCAL_TOON, 'laffmeter') })
        .setTitle('Welcome to the Fish Advisor!')
        .setImage(fisherman)
        .addFields(
            { name: 'What?', value: 'Find what new fish are easiest to catch!'},
            { name: 'Where?', value: 'Find what locations give you the best\nchance at catching a new fish!'},
        )
}

function getWhereEmbed(LOCAL_TOON) {
    return new EmbedBuilder()
        .setColor('Blue')
        .setAuthor({ name: LOCAL_TOON.toon.name, iconURL: getToonRendition(LOCAL_TOON, 'laffmeter') })
        .setTitle('Where should I go?')
        .setThumbnail(teleport)
        .setDescription(getFishInfo(LOCAL_TOON.fish, 'where'))
        .setFooter(getFooter())
}

function getWhatEmbed(LOCAL_TOON) {
    return new EmbedBuilder()
        .setColor('Blue')
        .setAuthor({ name: LOCAL_TOON.toon.name, iconURL: getToonRendition(LOCAL_TOON, 'laffmeter') })
        .setTitle('What should I catch?')
        .setThumbnail(getRandomFish())
        .setDescription(getFishInfo(LOCAL_TOON.fish, 'what'))
        .setFooter(getFooter())
}

function getFooter() {
    return { text: 'Number of buckets is an estimate and is not guaranteed.', iconURL: bucket }
}

function getWhereButton() {
    return new ButtonBuilder()
        .setCustomId('fish-where')
        .setLabel('Where?')
        .setStyle('Secondary')
}

function getWhatButton() {
    return new ButtonBuilder()
        .setCustomId('fish-what')
        .setLabel('What?')
        .setStyle('Secondary')
}

function getHomeButton() {
    return new ButtonBuilder()
        .setCustomId('fish-home')
        .setLabel('Home')
        .setStyle('Primary')
}

function getRefreshButton(type) {
    return new ButtonBuilder()
        .setCustomId(`fish-refresh:${type}`)
        .setLabel('Refresh')
        .setStyle('Danger')
}

function getHomeRow() {
    return new ActionRowBuilder()
        .addComponents(
            getWhatButton(), 
            getWhereButton()
        )
}

function getWhatRow() {
    return new ActionRowBuilder()
        .addComponents(
            getRefreshButton('what'),
            getHomeButton(), 
            getWhereButton()
        )
}

function getWhereRow() {
    return new ActionRowBuilder()
        .addComponents(
            getRefreshButton('where'),
            getHomeButton(), 
            getWhatButton()
        )
}

function getRandomFish() {
    const random = Math.floor(Math.random() * fish.length);
    return fish[random];
}

function getFishInfo(toon, type) {
    const fishcalc = new FishCalculator(JSON.stringify(toon));
    let topFive;

    if (fishcalc.getNew().length == 0) {
        return `You have maxed fishing. Congratulations!`;
    }

    if (type === 'where') {
        topFive = fishcalc.sortBestLocation().slice(0,5);
        topFive = topFive.map((place, index) => `${index+1}. ${place[0]}:  **${(place[1] * 100).toFixed(2)}%**`).join('\n');
        return topFive;
    } else if (type === 'what') {
        topFive = fishcalc.sortBestRarity().slice(0,5);
        topFive = topFive.map((fish, index) => `**${index+1}. ${fish.name} (${(fish.probability*100).toFixed(2)}%)**Location: ${fish.location}\nBuckets: ${fish.buckets}\n`).join('\n');
        return topFive;
    }
}