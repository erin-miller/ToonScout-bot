import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';
import { gagTracks, suitTypes, fishTypes } from './game.js';

const INFO = {
    name: 'info',
    type: 1, // 1 is CHAT_INPUT, or slash commands
    description: 'Show your toon\'s name, laff, and location.',
    integration_types: [1],
    contexts: [0, 1, 2], // can be used in servers (0), DMs with bot (1), and other DMs (2)
}

const TASK = {
    name: 'tasks',
    type: 1, 
    description: 'Show an overview of one or all your tasks.',
    integration_types: [1],
    contexts: [0, 1, 2],
    options: [
        {
            type: 3,
            name: 'task_number',
            description: 'Show detailed information about a specific task.',
            required: false,
            choices: [
                { name: '1', value: '1' },
                { name: '2', value: '2' },
                { name: '3', value: '3' },
                { name: '4', value: '4' },
            ],
        }
    ]
}

const GAGS = {
    name: 'gags',
    type: 1, 
    description: 'Show an overview of one or all your gags.',
    integration_types: [1],
    contexts: [0, 1, 2],
    options: [
        {
            type: 3,
            name: 'track',
            description: 'The gag track you want to show.',
            required: false,
            choices: gagTracks,
        },
    ],
}

const SUIT = {
    name: 'suit',
    type: 1, 
    description: 'Find information about your cog suits.',
    integration_types: [1],
    contexts: [0, 1, 2],
    options: [
        {
            type: 3,
            name: 'cog_type',
            description: 'The cog type you want to see.',
            required: true,
            choices: suitTypes,
        },
    ],
}

const FISH = {
    name: 'fish',
    type: 1, 
    description: 'Get advising on catching new fish.',
    integration_types: [1],
    contexts: [0, 1, 2],
    options: [
        {
            type: 3,
            name: 'advising',
            description: 'What fish or where should I go?',
            required: true,
            choices: fishTypes,
        },
    ],
}

// const BLANK = {
//     name: '',
//     type: 1, 
//     description: '',
//     integration_types: [1],
//     contexts: [0, 1, 2],
// }

const ALL_COMMANDS = [
  INFO,
  TASK,
  GAGS,
  SUIT,
  FISH
];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
