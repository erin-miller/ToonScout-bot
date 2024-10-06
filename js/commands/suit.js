import { 
    SlashCommandBuilder, 
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder 
} from 'discord.js';
import { InteractionResponseType } from 'discord-interactions';
import { LocalToonRequest, getToonRendition } from '../utils.js';
import SuitCalculator from 'toonapi-calculator/js/suits.js';

const gear = 'https://i.imgur.com/ezVOZkx.png';
const sellIcon = 'https://i.imgur.com/gGr9Mqp.png';
const cashIcon = 'https://i.imgur.com/Wo4aeDt.png';
const lawIcon = 'https://i.imgur.com/mYUrd1D.png';
const bossIcon = 'https://i.imgur.com/QrV9Zrx.png';

export const data = new SlashCommandBuilder()
        .setName('suit')
        .setDescription('Find information about your cog suits.')
        .setIntegrationTypes(1)
        .setContexts([0, 1, 2])

export async function execute(req, res) {
    const LOCAL_TOON = await LocalToonRequest('all.json');

    const row = new ActionRowBuilder()
        .addComponents(
            getSellButton(),
            getCashButton(),
            getLawButton(),
            getBossButton()
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
    switch (customId) {
        case 'suit-home':
            embed = getHomeEmbed(LOCAL_TOON)
            row = new ActionRowBuilder()
                .addComponents(
                    getSellButton(),
                    getCashButton(),
                    getLawButton(),
                    getBossButton()
                )
            break;
        case 'suit-sell':
            embed = getSellEmbed(LOCAL_TOON)
            row = new ActionRowBuilder()
                .addComponents(
                    getHomeButton(),
                    getCashButton(),
                    getLawButton(),
                    getBossButton()
                )
            break;
        case 'suit-cash':
            embed = getCashEmbed(LOCAL_TOON)
            row = new ActionRowBuilder()
                .addComponents(
                    getHomeButton(),
                    getSellButton(),
                    getLawButton(),
                    getBossButton()
                )
            break;
        case 'suit-law':
            embed = getLawEmbed(LOCAL_TOON)
            row = new ActionRowBuilder()
                .addComponents(
                    getHomeButton(),
                    getSellButton(),
                    getCashButton(),
                    getBossButton()
                )
            break;
        case 'suit-boss':
            embed = getBossEmbed(LOCAL_TOON)
            row = new ActionRowBuilder()
                .addComponents(
                    getHomeButton(),
                    getSellButton(),
                    getCashButton(),
                    getLawButton()
                )
            break;
        default:
            return;
    }

    return { embed, row };
}

function getHomeEmbed(LOCAL_TOON) {
    return new EmbedBuilder()
        .setColor('Red')
        .setAuthor({ name: LOCAL_TOON.toon.name, iconURL: getToonRendition(LOCAL_TOON, 'laffmeter') })
        .setTitle('Cog Suits')
        .setDescription('View your current suits or select department for more information.')
        .setThumbnail(gear)
        .addFields(
            { name: 'Sellbot', value: getBasicSuitInfo(LOCAL_TOON.cogsuits, 's')},
            { name: 'Cashbot', value: getBasicSuitInfo(LOCAL_TOON.cogsuits, 'm')},
            { name: 'Lawbot', value: getBasicSuitInfo(LOCAL_TOON.cogsuits, 'l')},
            { name: 'Bossbot', value: getBasicSuitInfo(LOCAL_TOON.cogsuits, 'c')},
        )
}

function getSellEmbed(LOCAL_TOON) {
    const embed = getSuitEmbed(LOCAL_TOON, 'Sellbot', 's')
    return embed.setThumbnail(sellIcon);
}

function getCashEmbed(LOCAL_TOON) {
    const embed = getSuitEmbed(LOCAL_TOON, 'Cashbot', 'm');
    return embed.setThumbnail(cashIcon);
}

function getLawEmbed(LOCAL_TOON) {
    const embed = getSuitEmbed(LOCAL_TOON, 'Lawbot', 'l');
    return embed.setThumbnail(lawIcon);
}

function getBossEmbed(LOCAL_TOON) {
    const embed = getSuitEmbed(LOCAL_TOON, 'Bossbot', 'c');
    return embed.setThumbnail(bossIcon);
}

function getSuitEmbed(LOCAL_TOON, title, type) {
    const suit = LOCAL_TOON.cogsuits;
    if (suit[type].hasDisguise) {
        return new EmbedBuilder()
            .setColor('Red')
            .setAuthor({ name: LOCAL_TOON.toon.name, iconURL: getToonRendition(LOCAL_TOON, 'laffmeter') })
            .setTitle(getBasicSuitInfo(suit, type))
            .setDescription(`${simplifyNeeded(suit, type)} to go!\nProgress: ${simplifyPromo(suit, type)}`)
            .addFields( 
                { name: 'Recommended Activities', value: getSuitPath(suit, type) },
            )
            .setFooter({ text: 'The recommended activites are optional!', iconURL: gear });
    } else {
        return new EmbedBuilder()
            .setColor('Red')
            .setAuthor({ name: LOCAL_TOON.toon.name, iconURL: getToonRendition(LOCAL_TOON, 'laffmeter') })
            .setTitle(title)
            .setDescription(`This toon has no ${title} disguise.`)
    }
}

function getHomeButton() {
    return new ButtonBuilder()
        .setCustomId('suit-home')
        .setLabel('Home')
        .setStyle('Primary')
}

function getSellButton() {
    return new ButtonBuilder()
        .setCustomId('suit-sell')
        .setLabel('Sellbot')
        .setStyle('Secondary')
}

function getCashButton() {
    return new ButtonBuilder()
        .setCustomId('suit-cash')
        .setLabel('Cashbot')
        .setStyle('Secondary')
}

function getLawButton() {
    return new ButtonBuilder()
        .setCustomId('suit-law')
        .setLabel('Lawbot')
        .setStyle('Secondary')
}

function getBossButton() {
    return new ButtonBuilder()
        .setCustomId('suit-boss')
        .setLabel('Bossbot')
        .setStyle('Secondary')
}

function getSuitPath(toon, type) {
    const calc = new SuitCalculator(JSON.stringify(toon));
    const { path, total } = calc.getBestPathWeighted(type);
    let weighted = {};
    path.forEach(item => {
        weighted[item] = (weighted[item] || 0) + 1;
    })

    let result = '';
    for (const [item, count] of Object.entries(weighted)) {
        result += `(${count}) ${item}\n`;
    }
    return result + `**Estimated earnings:** ${total}`;
}

function getBasicSuitInfo(toon, type) {
    const suitType = toon[type];
    if (suitType.hasDisguise) {
        const prestige = suitType.version == 2 ? ' v2.0' : '';
        return `${suitType.suit.name}, Level ${suitType.level}${prestige}`
    }
    return 'No disguise!';
}

function simplifyPromo(toon, type) {
    const calc = new SuitCalculator(JSON.stringify(toon));
    return `${calc.getCurrent(type)} / ${calc.getTarget(type)}`;
}

function simplifyNeeded(toon, type) {
    const calc = new SuitCalculator(JSON.stringify(toon));
    return calc.getNeeded(type);
}