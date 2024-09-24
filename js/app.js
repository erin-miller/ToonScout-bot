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
} from './utils.js';

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
            const LOCAL_TOON = await LocalToonRequest();
            if (command === 'info') {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `${globalUser}'s toon, **${LOCAL_TOON.toon.name}**, has ${simplifyLaff(LOCAL_TOON)} laff and is located in ${simplifyLocation(LOCAL_TOON)}.`,
                    },
                });
            };

            if (command === 'tasks') {
                const index = data.options && data.options.length > 0 ? data.options[0].value : null;
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: getTaskInfo(LOCAL_TOON, index),
                    }
                });
            }

            if (command === 'gags') {
                // default to null if no option provided
                const track = data.options && data.options.length > 0 ? data.options[0].value : null;
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: getGagInfo(LOCAL_TOON, track),
                    }
                })
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
