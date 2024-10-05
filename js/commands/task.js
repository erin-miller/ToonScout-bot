import { SlashCommandBuilder } from 'discord.js';
import { InteractionResponseType } from 'discord-interactions';
import { LocalToonRequest } from '../utils.js';
const INDENT = `        `;

export const data = new SlashCommandBuilder()
        .setName('tasks')
        .setDescription('Show an overview of one or all your tasks.')
        .setIntegrationTypes(1)
        .setContexts([0, 1, 2])
        .addStringOption(option =>
            option
                .setName('task_number')
                .setDescription('Show detailed information about a specific task.')
                .setRequired(false)
                .addChoices(
                    { name: '1', value: '1' },
                    { name: '2', value: '2' },
                    { name: '3', value: '3' },
                    { name: '4', value: '4' }
                )
        );

export async function execute(req, res) {
    const LOCAL_TOON = await LocalToonRequest('info.json');
    const { data } = req.body;
    const index = data.options && data.options.length > 0 ? data.options[0].value : null;
    return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: getTaskInfo(LOCAL_TOON, index),
        }
    });
}

function getTaskInfo(toon, index) {
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

function getTaskTypeDetailed(taskInfo) {
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

function getTaskTypeSimple(taskInfo) {
    const progress = taskInfo.objective.progress.text;
    if (progress !== 'Complete' && progress !== '') { // not a visit task, don't display npc values
        return `${taskInfo.objective.text} (${taskInfo.objective.progress.text})`;
    } else { // display npc values for a visit task
        return `Visit ${taskInfo.to.building} on ${taskInfo.to.zone}, ${taskInfo.to.neighborhood}`;
    }
}