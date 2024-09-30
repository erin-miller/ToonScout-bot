import 'dotenv/config';
import express from 'express';
import { InteractionType, InteractionResponseType } from 'discord-interactions';
import {
    VerifyDiscordRequest,
    LocalToonRequest,
    simplifyLaff,
    simplifyLocation,
    getGagInfo,
    getTaskInfo,
    getSuitInfo,
    getFishInfo,
} from './utils.js';

// set request types
const info = "info.json";
const fish = "fish.json";
const flowers = "flowers.json";
const suits = "cogsuits.json";
const golf = "golf.json";
const racing = "racing.json";

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package

app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

app.post('/interactions', async function (req, res) {
    const { type, data, member, user: direct } = req.body;
    
    // verification requests
    if (type === InteractionType.PING) {
        return res.send({ type: InteractionResponseType.PONG });
    }

    // checking for commands
    if (type === InteractionType.APPLICATION_COMMAND) {
        const { name: command } = data;

        let user;
        let globalUser;

        // check if user has multiple discord accounts or not
        if (direct) {
            user = direct.username;
            globalUser = direct.global_name;
        } else {
            user = member.user.username;
            globalUser = member.user.username;
        }

        console.log(`USER [ ${user} ] RAN [ ${command} ]`);
        
        try {
            let LOCAL_TOON;
            if (command === 'info') {
                LOCAL_TOON = await LocalToonRequest(info);
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `${globalUser}'s toon, **${LOCAL_TOON.toon.name}**, has ${simplifyLaff(LOCAL_TOON)} laff and is located in ${simplifyLocation(LOCAL_TOON)}.`,
                    },
                });
            };

            if (command === 'tasks') {
                LOCAL_TOON = await LocalToonRequest(info);
                const index = data.options && data.options.length > 0 ? data.options[0].value : null;
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: getTaskInfo(LOCAL_TOON, index),
                    }
                });
            }

            if (command === 'gags') {
                LOCAL_TOON = await LocalToonRequest(info);
                // default to null if no option provided
                const track = data.options && data.options.length > 0 ? data.options[0].value : null;
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: getGagInfo(LOCAL_TOON, track),
                    }
                });
            }

            if (command === 'suit') {
                LOCAL_TOON = await LocalToonRequest(suits);
                const cogsuit = data.options && data.options.length > 0 ? data.options[0].value : null;
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: getSuitInfo(JSON.stringify(LOCAL_TOON), cogsuit),
                    }
                });
            }
            
            if (command === 'fish') {
                LOCAL_TOON = await LocalToonRequest(fish);
                const type = data.options && data.options.length > 0 ? data.options[0].value : null;
                const fishInfo = getFishInfo(JSON.stringify(LOCAL_TOON), type);
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: fishInfo,
                    }
                });
            }

        } catch (error) {
            console.error(error);
        }
    }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});

process.on('SIGINT', () => {
    console.log("Shutting down...");
    process.exit();
})
