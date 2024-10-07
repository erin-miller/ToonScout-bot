import { 
    SlashCommandBuilder, 
    EmbedBuilder,
} from 'discord.js';
import { InteractionResponseType } from 'discord-interactions';
import { LocalToonRequest, getToonRendition } from '../utils.js';

const trooper = 'https://i.imgur.com/eYjdODE.png';

export const data = new SlashCommandBuilder()
        .setName('tasks')
        .setDescription('Show an overview of one or all your tasks.')
        .setIntegrationTypes(1)
        .setContexts([0, 1, 2])

export async function execute(req, res) {
    const LOCAL_TOON = await LocalToonRequest('info.json');
    const tasks = getTasks(LOCAL_TOON);
    
    const embed = new EmbedBuilder()
        .setColor('Green')
        .setAuthor({ name: LOCAL_TOON.toon.name, iconURL: getToonRendition(LOCAL_TOON, 'laffmeter') })
        .setThumbnail(trooper)

    tasks.forEach(task => {
        embed.addFields(task);
    })

    return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            embeds: [embed],
        }
    });
}

function getTasks(LOCAL_TOON) {
    const toontasks = LOCAL_TOON.tasks;
    if (toontasks.length == 0) {
        return { name: '', value: 'This toon has no tasks right now!'};
    }    
    let taskList = []
    for (const task of toontasks) {
        taskList.push(getTaskType(task))
    }
    return taskList;
}

function getForFun(task) {
    return task.deletable ? ` (Just For Fun)` : ``;
}

function getTaskType(task) {
    const progress = task.objective.progress.text;
    if (progress !== 'Complete' && progress !== '') { // not a visit task, don't display npc values
        return { name: `${task.objective.text}${getForFun(task)}`, value: `Progress: ${progress}\nReward: ${task.reward}`}
    } else { // display npc values for a visit task
        return { name: `Visit ${task.to.name} in ${task.to.building}`, value: `Location: ${task.to.zone}, ${task.to.neighborhood}\nReward: ${task.reward}` }
    }
}