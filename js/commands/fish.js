import { 
    SlashCommandBuilder, 
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder 
} from 'discord.js';
import { InteractionResponseType } from 'discord-interactions';
import FishCalculator from 'toonapi-calculator/js/fish.js';
import { getToonRendition } from '../utils.js';
import { getToken } from '../db/token.js';

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
let footer = '';

export const data = new SlashCommandBuilder()
        .setName('fish')
        .setDescription('Get advising on catching new fish.')
        .setIntegrationTypes(1)
        .setContexts([0, 1, 2])
        .addUserOption(option => 
            option.setName('user')
            .setDescription('(Optional) Get the specified user\'s toon info.')
            .setRequired(false)
        )

export async function execute(req, res, target) {
    const item = await getToken(target);
    footer = getFooter(item.data);
    const row = new ActionRowBuilder()
        .addComponents(
            getWhatButton(target),
            getWhereButton(target)
        )
    
    return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            embeds: [getHomeEmbed(item)],
            components: [row]
        }
    });
}

export async function handleButton(req, customId) {
    let embed;
    let row;
    let target;
    let state;

    const parts = customId.split(':');
    const action = parts[0];

    if (parts.length === 3) {
        state = parts[1];
        target = parts[2];
    } else {
        state = null;
        target = parts[1];
    }

    const item = await getToken(target); 

    switch (action) {
        case 'fish-refresh':
            switch (state) {
                case 'what':
                    embed = getWhatEmbed(item);
                    row = getWhatRow(target);
                    break;
                case 'where':
                    embed = getWhereEmbed(item);
                    row = getWhereRow(target);
                    break;
                default:
                    return;
            }
            break;
        case 'fish-where':
            embed = getWhereEmbed(item);
            row = getWhereRow(target);
            break;
        case 'fish-what':
            embed = getWhatEmbed(item);
            row = getWhatRow(target);
            break;
        case 'fish-home':
            embed = getHomeEmbed(item);
            row = getHomeRow(target);
            break;
        default:
            return;
    }

    return { embed, row };
}

function getHomeEmbed(item) {
    const toon = item.data;
    return new EmbedBuilder()
        .setColor('Blue')
        .setAuthor({ name: toon.toon.name, iconURL: getToonRendition(toon, 'laffmeter') })
        .setTitle('Welcome to the Fish Advisor!')
        .setDescription(`You have caught **${getFishCount(toon.fish)}**!`)
        .setImage(fisherman)
        .addFields(
            { name: 'What?', value: 'Find what new fish are easiest to catch!'},
            { name: 'Where?', value: 'Find what locations give you the best\nchance at catching a new fish!'},
        )
        .setFooter(footer)
        .setTimestamp(item.modified)
}

function getWhereEmbed(item) {
    const toon = item.data;
    return new EmbedBuilder()
        .setColor('Blue')
        .setAuthor({ name: toon.toon.name, iconURL: getToonRendition(toon, 'laffmeter') })
        .setTitle('Where should I go?')
        .setThumbnail(teleport)
        .setDescription(getFishInfo(toon.fish, 'where'))
        .setFooter(footer)
        .setTimestamp(item.modified)
}

function getWhatEmbed(item) {
    const toon = item.data;
    return new EmbedBuilder()
        .setColor('Blue')
        .setAuthor({ name: toon.toon.name, iconURL: getToonRendition(toon, 'laffmeter') })
        .setTitle('What should I catch?')
        .setThumbnail(getRandomFish())
        .setDescription(getFishInfo(toon.fish, 'what'))
        .setFooter(footer)
        .setTimestamp(item.modified)
}

function getFooter(toon) {
    return { text: `Number of buckets is an estimate.\n${getFishCount(toon.fish)}`, iconURL: bucket }
}

function getFishCount(toon) {
    const fishcalc = new FishCalculator(JSON.stringify(toon));
    const catchable = fishcalc.getCatchable().length;
    const caught = fishcalc.getCaught().length;
    return `${caught}/${catchable} fish`;
}

function getWhereButton(target) {
    return new ButtonBuilder()
        .setCustomId(`fish-where:${target}`)
        .setLabel('Where?')
        .setStyle('Secondary')
}

function getWhatButton(target) {
    return new ButtonBuilder()
        .setCustomId(`fish-what:${target}`)
        .setLabel('What?')
        .setStyle('Secondary')
}

function getHomeButton(target) {
    return new ButtonBuilder()
        .setCustomId(`fish-home:${target}`)
        .setLabel('Home')
        .setStyle('Primary')
}

function getRefreshButton(type, target) {
    return new ButtonBuilder()
        .setCustomId(`fish-refresh:${type}:${target}`)
        .setLabel('Refresh')
        .setStyle('Danger')
}

function getHomeRow(target) {
    return new ActionRowBuilder()
        .addComponents(
            getWhatButton(target), 
            getWhereButton(target)
        )
}

function getWhatRow(target) {
    return new ActionRowBuilder()
        .addComponents(
            getRefreshButton('what', target),
            getHomeButton(target), 
            getWhereButton(target)
        )
}

function getWhereRow(target) {
    return new ActionRowBuilder()
        .addComponents(
            getRefreshButton('where', target),
            getHomeButton(target), 
            getWhatButton(target)
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
	    topFive = topFive.map(([location, { total, buckets }], index) =>`**${index + 1}. ${location} (${(total*100).toFixed(2)}%)**Buckets: ${buckets}\n`).join('\n');
        return topFive;
    } else if (type === 'what') {
        topFive = fishcalc.sortBestRarity().slice(0,5);
        topFive = topFive.map((fish, index) => `**${index+1}. ${fish.name} (${(fish.probability*100).toFixed(2)}%)**Location: ${fish.location}\nBuckets: ${fish.buckets}\n`).join('\n');
  	return topFive;
    }
}
